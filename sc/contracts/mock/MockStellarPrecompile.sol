//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../StelMemo.sol";

contract MockStellarPreCompile {
    uint256 private nextId = 1;
    mapping(uint256 => bool) public activeSubscriptions;

    function subscribe(
        IStellarReactivityPrecompile.SubscriptionData memory
    ) external returns (uint256) {
        uint256 id = nextId;
        nextId++;

        activeSubscriptions[id] = true;
        return id;
    }

    function unsubscribe(uint256 subscriptionId) external {
        activeSubscriptions[subscriptionId] = false;
    }

    function triggerOnEvent(
        address stelMemoAddress,
        uint256 subscriptionId
    ) external {
        bytes32[] memory topics = new bytes32[](1);
        topics[0] = bytes32(subscriptionId);

        IStellarEventHandler(stelMemoAddress).onEvent(subscriptionId, topics, "");
    }
}