import {expect} from "chai";
import {ethers} from "hardhat";
import {StelMemo, MockStellarPreCompile} from "../typechain-types";
import {SignerWithAddress} from "@nomicfoundattion/hardhat-ethers/signers";

describe("StelMemo", function () {
    let stelMemo: StelMemo;
    let mockPrecompile: MockStellarPreCompile;
    let owner: SignerWithAddress;
    let beneficiary: SignerWithAddress;
    let hacker: SignerWithAddress;

    beforeEach(async function () {
        [owner, beneficiary, hacker] = await ethers.getSigners();
        const MockFactory = await ethers.getContractFactory("MockStellarPreCompile");
        mockPrecompile = await MockFactory.deploy();
        await mockPrecompile.waitForDeployment();
        const mockAddress = await mockPrecompile.getAddress();
        const StelMemoFactory = await ethers.getContractFactory("StelMemo");
        stelMemo = await StelMemoFactory.deploy(mockAddress);
        await stelMemo.waitForDeployment();
    });

    //test registerWill
    describe("registerWill", function (){
        it("should register a new will succesfully", async function () {
            await stelMemo.connect(owner).registerWill(beneficiary.address, 30);
            const info = await stelMemo.getWillInfo(owner.address);
            expect(info.beneficiary).to.equal(beneficiary.address);
            expect(info.active).to.equal(true);
            expect(info.executed).to.equal(false);
        });

        it("should fail if beneficiary = self", async function () {
            await expect(
                stelMemo.connect(owner).registerWill(owner.address, 30)
            ).to.be.revertedWith("StelMemo: Beneficiary cannot be the same as owner");
        });

        it("should fail if period is not valid", async function () {
            await expect(
                stelMemo.connect(owner).registerWill(beneficiary.address, 45)
            ).to.be.revertedWith("StelMemo: Period is not valid");
        });

        it("should fail if will already exists", async function () {
            await stelMemo.connect(owner).registerWill(beneficiary.address, 30);
            await expect (
                stelMemo.connect(owner).registerWill(beneficiary.address, 90)
            ).to.be.revertedWith("StelMemo: Will already registered");
        });     
    });
    
    //test depositXLM
    describe("depositXLM", function () {
        beforeEach(async function () {
            await stelMemo.connect(owner).registerWill(beneficiary.address, 30);
        });

        it("should add vault XLM balance", async function () {
            const depositAmount = ethers.parseEther("1.0");
            await stelMemo.connect(owner).depositXLM({value: depositAmount});
            const balance = await stelMemo.vaultXLM(owner.address);
            expect(balance).to.equal(depositAmount);
        });

        it("should fail if deposit 0 XLM", async function () {
            await expect(
                stelMemo.connect(owner).depositXLM({value: 0})
            ).to.be.revertedWith("StelMemo: Amount must be greater than 0");
        });
    });

    //test checkIn

    describe("checkIn", function () {
        this.beforeEach(async function () {
            await stelMemo.connect(owner).registerWill(beneficiary.address, 30);
        });

        it("should update lastCheckIn", async function () {
            const before = await stelMemo.getWillInfo(owner.address);
            await stelMemo.connect(owner).checkIn();
            const after = await stelMemo.getWillInfo(owner.address);
            expect(after.lastCheckIn).to.be.greaterThanOrEqual(before.lastCheckIn);
        });
    });

    //test onEvent

    describe("onEvnt - inheritance execution", function () {
        it("should transfer XLM to the beneficiary when the deadline is reached", async function () {

            await stelMemo.connect(owner).registerWill(beneficiary.address, 30);
    
            const depositAmount = ethers.parseEther("1.0");
            await stelMemo.connect(owner).depositXLM({ value: depositAmount });

            const vaultBalance = await stelMemo.vaultXLM(owner.address);
            expect(vaultBalance).to.equal(depositAmount);

            await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine", []);

            const stelMemoAddress = await stelMemo.getAddress();
            const balanceBefore = await ethers.provider.getBalance(beneficiary.address);
            await expect(
                mockPrecompile.triggerOnEvent(stelMemoAddress, 1n)
            ).to.not.be.reverted;

            const balanceAfter = await ethers.provider.getBalance(beneficiary.address);
            expect(balanceAfter).to.be.greaterThan(balanceBefore);

            const willInfo = await stelMemo.getWillInfo(owner.address);
            expect(willInfo.executed).to.equal(true);
        });
    });

    //test Security

    describe("Security", function () {
        it("onEvent with unregistered subscriptionId should do nothing", async function () {
            await stelMemo.connect(owner).registerWill(beneficiary.address, 30);
            const depositAmount = ethers.parseEther("1.0");
            await stelMemo.connect(owner).depositXLM({ value: depositAmount });

            // subscriptionId 999 tidak terdaftar → harus silent return, vault tidak berubah
            await expect(
                stelMemo.connect(hacker).onEvent(999n, [], "0x")
            ).to.not.be.reverted;

            const vaultAfter = await stelMemo.vaultXLM(owner.address);
            expect(vaultAfter).to.equal(depositAmount); // vault tidak berubah
        });
    });
});
