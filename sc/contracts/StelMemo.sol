// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IStellarReactivityPrecompile {
    struct SubscriptionData {
        bytes32[4] eventTopics;
        address origin;
        address caller;
        address emitter;
        address handlerContractAddress;
        bytes4 handlerFunctionSelector;
        uint64 priorityFeePerGas;
        uint64 maxFeePerGas;
        uint64 gasLimit;
        bool isGuaranteed;
        bool isCoalesced;
    }

    function subscribe(SubscriptionData memory data) external returns (uint256);
    function unsubscribe(uint256 subscriptionId) external;

}

interface IStellarEventHandler {
    function onEvent(uint256 subscriptionId, bytes32[] calldata eventTopics, bytes calldata eventData) external;
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

library StellarExtensions {
    address internal constant STELLAR_REACTIVITY_PRECOMPILE = 0x0000000000000000000000000000000000000100;
    bytes32 internal constant SCHEDULE_SELECTOR = keccak256("Schedule(uint256)");
}

contract StelMemo is IStellarEventHandler {
    IStellarReactivityPrecompile public immutable reactivityPrecompile;
    address public immutable precompileAddress;

    struct TokenAsset {
        address tokenAddress;
        uint256 amount;
    }

    struct NFTAsset {
        address nftContract;
        uint256 tokenId;
    }

    struct Will {
        address owner;
        address beneficiary;
        uint256 lastCheckIn;
        uint256 inactivePeriod;
        uint256 deadlineTimestamp;
        bool executed;
        bool active;
        uint256 subscriptionId;
    }

    struct VaultRecord {
        uint8 actType;
        address asset;     
        uint256 amount;     
        uint256 timestamp;
        uint256 blockNumber;
    }

    struct CheckInRecord {
        uint256 timestamp;
        uint256 blockNumber;
    }

    mapping(address => Will) public wills;
    mapping(address => uint256) public vaultXLM;
    mapping(address => TokenAsset[]) public vaultTokens;
    mapping(address => NFTAsset[]) public vaultNFTs;
    mapping(uint256 => address) public subscriptionIdToOwner;
    mapping(uint256 => address) public deadlineToOwner;

    mapping(address => CheckInRecord[]) private _checkInHistory;
    mapping(address => VaultRecord[]) private _vaultHistory;

    event WillRegistered(address indexed owner, address indexed beneficiary, uint256 deadlineMs);
    event CheckedIn(address indexed owner, uint256 newDeadlineMs);
    event WillExecuted(address indexed owner, address indexed beneficiary, uint256 executedAt);
    event WillDeactivates(address indexed owner);
    event BeneficiaryUpdated(address indexed owner, address indexed newBeneficiary);
    event DepositXLM(address indexed owner, uint256 amount);
    event DepositToken(address indexed owner, address indexed token, uint256 amount);
    event DepositNFT(address indexed owner, address indexed nftContract, uint256 tokenId);
    event Withdrawn(address indexed owner, uint256 xlmAmount);

    modifier onlyActiveWill() {
        require(wills[msg.sender].owner != address(0), "StelMemo: No will found");
        require(wills[msg.sender].active, "StelMemo: Will is not active");
        require(!wills[msg.sender].executed, "StelMemo: Will already executed");
        _;
    }

    constructor(address _precompileAddress) {
    reactivityPrecompile = IStellarReactivityPrecompile(_precompileAddress);
    precompileAddress = _precompileAddress;
    }

    function registerWill(
        address _beneficiary,
        uint256 _inactivePeriodSec
    ) external {
        require(_beneficiary != address(0), "StelMemo: Beneficiary cannot be zero address/Beneficiary is not valid");
        require(_beneficiary != msg.sender, "StelMemo: Beneficiary cannot be the same as owner");
        require(!wills[msg.sender].active, "StelMemo: Will already registered");
        uint256 inactivePeriodSec = _inactivePeriodSec;
        uint256 deadLineMs = (block.timestamp + inactivePeriodSec) * 1000;
        uint256 subId = _createScheduleSubscription(deadLineMs);
        wills[msg.sender] = Will({
            owner: msg.sender,
            beneficiary: _beneficiary,
            lastCheckIn: block.timestamp,
            inactivePeriod: inactivePeriodSec,
            deadlineTimestamp: deadLineMs,
            executed: false,
            active: true,
            subscriptionId: subId
        });

        subscriptionIdToOwner[subId] = msg.sender;
        deadlineToOwner[deadLineMs / 1000 * 1000] = msg.sender;
        emit WillRegistered(msg.sender, _beneficiary, deadLineMs);

    }

    function checkIn() external onlyActiveWill {
        Will storage will = wills[msg.sender];

        // TEMP: skip unsubscribe untuk debug
        // reactivityPrecompile.unsubscribe(will.subscriptionId);
        // delete subscriptionIdToOwner[will.subscriptionId];

        uint256 newDeadlineMs = (block.timestamp + will.inactivePeriod) * 1000;
        uint256 newSubId = _createScheduleSubscription(newDeadlineMs);

        delete deadlineToOwner[will.deadlineTimestamp / 1000 * 1000]; 
        deadlineToOwner[newDeadlineMs / 1000 * 1000] = msg.sender;  

        will.lastCheckIn = block.timestamp;
        will.deadlineTimestamp = newDeadlineMs;
        will.subscriptionId = newSubId;
        subscriptionIdToOwner[newSubId] = msg.sender;

        _checkInHistory[msg.sender].push(CheckInRecord({
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        emit CheckedIn(msg.sender, newDeadlineMs);
    }

    function depositXLM() external payable onlyActiveWill {
        require(msg.value > 0, "StelMemo: Amount must be greater than 0");
        vaultXLM[msg.sender] += msg.value;
        _vaultHistory[msg.sender].push(VaultRecord({
            actType: 0,
            asset: address(0),
            amount: msg.value,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        emit DepositXLM(msg.sender, msg.value);
    }

    function depositToken(address _tokenAddress, uint256 _amount) external onlyActiveWill{
        require(_amount > 0, "StelMemo: Amount must be greater than 0");
        bool success = IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        require(success, "StelMemo: Token transfer failed");

        bool found = false;
        for (uint256 i = 0; i < vaultTokens[msg.sender].length; i++) {
            if (vaultTokens[msg.sender][i].tokenAddress == _tokenAddress) {
                vaultTokens[msg.sender][i].amount += _amount;
                found = true;
                break;
            }
        }

        if (!found) {
            vaultTokens[msg.sender].push(TokenAsset({
                tokenAddress: _tokenAddress,
                amount: _amount
            }));
        }

        _vaultHistory[msg.sender].push(VaultRecord({
            actType: 1,
            asset: _tokenAddress,
            amount: _amount,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        emit DepositToken(msg.sender, _tokenAddress, _amount);
    }

    function depositNFT(address _nftContract, uint256 _tokenId) external onlyActiveWill {
        require(IERC721(_nftContract).ownerOf(_tokenId) == msg.sender, "StelMemo: Not the owner of the NFT");
        IERC721(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);
        vaultNFTs[msg.sender].push(NFTAsset({
            nftContract: _nftContract,
            tokenId: _tokenId
        }));

        _vaultHistory[msg.sender].push(VaultRecord({
            actType: 2,
            asset: _nftContract,
            amount: _tokenId,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        emit DepositNFT(msg.sender, _nftContract, _tokenId);
    }

    function withdraw() external onlyActiveWill {
        uint256 xlmAmount = vaultXLM[msg.sender];
        vaultXLM[msg.sender] = 0;

        if (xlmAmount > 0) {
            _vaultHistory[msg.sender].push(VaultRecord({
                actType: 3,
                asset: address(0),
                amount: xlmAmount,
                timestamp: block.timestamp,
                blockNumber: block.number
            }));
        }

        uint256 tokenCount = vaultTokens[msg.sender].length;
        for (uint256 i = 0; i < tokenCount; i++) {
            TokenAsset memory asset = vaultTokens[msg.sender][i];
            if (asset.amount > 0) {
                IERC20(asset.tokenAddress).transfer(msg.sender, asset.amount);
                _vaultHistory[msg.sender].push(VaultRecord({
                    actType: 4,
                    asset: asset.tokenAddress,
                    amount: asset.amount,
                    timestamp: block.timestamp,
                    blockNumber: block.number
                }));
            }
        }
        delete vaultTokens[msg.sender];

        uint256 nftCount = vaultNFTs[msg.sender].length;
        for (uint256 i = 0; i < nftCount; i++) {
            NFTAsset memory nft = vaultNFTs[msg.sender][i];
            IERC721(nft.nftContract).safeTransferFrom(address(this), msg.sender, nft.tokenId);
            _vaultHistory[msg.sender].push(VaultRecord({
                actType: 5,
                asset: nft.nftContract,
                amount: nft.tokenId,
                timestamp: block.timestamp,
                blockNumber: block.number
            }));
        }
        delete vaultNFTs[msg.sender];

        if (xlmAmount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: xlmAmount}("");
            require(sent, "StelMemo: Failed to send XLM");
        }

        emit Withdrawn(msg.sender, xlmAmount);
    }

    function updateBeneficiary(address _newBeneficiary) external onlyActiveWill {
        require(_newBeneficiary != address(0), "StelMemo: Invalid beneficiary address");
        require(_newBeneficiary != msg.sender, "StelMemo: Cannot be yourself");

        wills[msg.sender].beneficiary = _newBeneficiary;
        emit BeneficiaryUpdated(msg.sender, _newBeneficiary);
    }

    function updateInactiveperiod(uint256 _newPeriodSec) external onlyActiveWill {
        Will storage will = wills[msg.sender];

        // reactivityPrecompile.unsubscribe(will.subscriptionId);
        // delete subscriptionIdToOwner[will.subscriptionId];

        uint256 newPeriodSec = _newPeriodSec;
        uint256 newDeadlineMs = (block.timestamp + newPeriodSec) * 1000;
        uint256 newSubId = _createScheduleSubscription(newDeadlineMs);

        will.inactivePeriod = newPeriodSec;
        will.deadlineTimestamp = newDeadlineMs;
        will.subscriptionId = newSubId;
        will.lastCheckIn = block.timestamp;

        subscriptionIdToOwner[newSubId] = msg.sender;
    }

    function deactive() external onlyActiveWill {
        Will storage will = wills[msg.sender];
        will.active = false;

        emit WillDeactivates(msg.sender);

        uint256 xlmAmount = vaultXLM[msg.sender];
        vaultXLM[msg.sender] = 0;

        if (xlmAmount > 0) {
            _vaultHistory[msg.sender].push(VaultRecord({
                actType: 3,
                asset: address(0),
                amount: xlmAmount,
                timestamp: block.timestamp,
                blockNumber: block.number
            }));
        }

        uint256 tokenCount = vaultTokens[msg.sender].length;
        for (uint256 i = 0; i < tokenCount; i++) {
            TokenAsset memory asset = vaultTokens[msg.sender][i];
            if (asset.amount > 0) {
                IERC20(asset.tokenAddress).transfer(msg.sender, asset.amount);
                _vaultHistory[msg.sender].push(VaultRecord({
                    actType: 4,
                    asset: asset.tokenAddress,
                    amount: asset.amount,
                    timestamp: block.timestamp,
                    blockNumber: block.number
                }));
            }
        }
        delete vaultTokens[msg.sender];

        uint256 nftCount = vaultNFTs[msg.sender].length;
        for (uint256 i = 0; i < nftCount; i++) {
            NFTAsset memory nft = vaultNFTs[msg.sender][i];
            IERC721(nft.nftContract).safeTransferFrom(address(this), msg.sender, nft.tokenId);
            _vaultHistory[msg.sender].push(VaultRecord({
                actType: 5,
                asset: nft.nftContract,
                amount: nft.tokenId,
                timestamp: block.timestamp,
                blockNumber: block.number
            }));
        }
        delete vaultNFTs[msg.sender];

        if (xlmAmount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: xlmAmount}("");
            require(sent, "StelMemo: Failed to send XLM");
        }
    }

    function getWillInfo(address _owner) external view returns (
        address beneficiary,
        uint256 lastCheckIn,
        uint256 inactivePeriod,
        uint256 deadlineTimestamp,
        bool executed,
        bool active
    ) {
        Will storage will = wills[_owner];
        return (
            will.beneficiary,
            will.lastCheckIn,
            will.inactivePeriod,
            will.deadlineTimestamp,
            will.executed,
            will.active
        );
    }

    function getStatus(address _owner) external view returns (string memory) {
        Will storage will = wills[_owner];

        if (!will.active || will.executed) return "Inactive";
        uint256 deadlineSec = will.deadlineTimestamp / 1000;
        
        if (block.timestamp >= deadlineSec) return "Inactive";
        uint256 warningThreshold = deadlineSec - (7 * 1 days);

        if (block.timestamp >= warningThreshold) return "Warning";
        return "Active";
    }

    function getCheckInHistory(address _owner) external view returns (CheckInRecord[] memory) {
        return _checkInHistory[_owner];
    }

    function getVaultHistory(address _owner) external view returns (VaultRecord[] memory) {
        return _vaultHistory[_owner];
    }

    receive() external payable {
        if (wills[msg.sender].active) {
            vaultXLM[msg.sender] += msg.value;
            emit DepositXLM(msg.sender, msg.value);
        }
    }

    function _createScheduleSubscription(uint256 _deadlineMs) internal returns (uint256) {
        bytes32[4] memory topics;
        topics[0] = keccak256("Schedule(uint256)");
        topics[1] = bytes32(_deadlineMs);
        topics[2] = bytes32(0);
        topics[3] = bytes32(0);

        IStellarReactivityPrecompile.SubscriptionData memory data = IStellarReactivityPrecompile.SubscriptionData({
            eventTopics: [topics[0], topics[1], topics[2], topics[3]],
            origin: address(0),
            caller: address(0),
            emitter: StellarExtensions.STELLAR_REACTIVITY_PRECOMPILE,
            handlerContractAddress: address(this),
            handlerFunctionSelector: IStellarEventHandler.onEvent.selector,
            priorityFeePerGas: 2000000000,
            maxFeePerGas: 10000000000,
            gasLimit: 3000000,
            isGuaranteed: true,
            isCoalesced: false
        });
        return reactivityPrecompile.subscribe(data);
    }

    // --------------------------------------------------------
    // DEV ONLY
    // --------------------------------------------------------
    function devWithdraw() external {
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(sent, "StelMemo: Failed to withdraw");
    }

    function onEvent(
        uint256 subscriptionId,
        bytes32[] calldata eventTopics,
        bytes calldata /*eventData*/)
        external override {
     
            address owner = subscriptionIdToOwner[subscriptionId];
            if (owner == address(0) && eventTopics.length > 1) {
                uint256 deadlineKey = uint256(eventTopics[1]) / 1000 * 1000;
                owner = deadlineToOwner[deadlineKey];
            }
            if (owner == address(0)) return;

            Will storage will = wills[owner];
            if (!will.active || will.executed) return;

            will.executed = true;
            will.active = false;

            address beneficiary = will.beneficiary;

            uint256 xlmAmount = vaultXLM[owner];
            if (xlmAmount > 0) {
                vaultXLM[owner] = 0;
                (bool sent, ) = payable(beneficiary).call{value: xlmAmount}("");
                require(sent, "StelMemo: Failed to send XLM");
            }

            uint256 tokenCount = vaultTokens[owner].length;
            for (uint256 i = 0; i < tokenCount; i++) {
                TokenAsset memory asset = vaultTokens[owner][i];
            if (asset.amount > 0) {
                IERC20(asset.tokenAddress).transfer(beneficiary, asset.amount);
                }
            }
            delete vaultTokens[owner];

            uint256 nftCount = vaultNFTs[owner].length;
            for(uint256 i = 0; i < nftCount; i++) {
                NFTAsset memory nft = vaultNFTs[owner][i];
                IERC721(nft.nftContract).safeTransferFrom(address(this), beneficiary, nft.tokenId);
            }
            delete vaultNFTs[owner];

            emit WillExecuted(owner, beneficiary, block.timestamp);
    }

}