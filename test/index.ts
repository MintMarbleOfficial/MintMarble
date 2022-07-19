import { expect } from "chai";
import { ethers } from "hardhat";
import { address_zero, accounts, owner, minter, buyer, receiver, signer, failTest } from "./common";
import { MyWorldToken } from "../typechain/MyWorldToken";

function timeout(ms: number) {
    console.log("waiting", ms);
    return new Promise((resolve) => setTimeout(resolve, ms));
}
describe("MyWorldToken", function () {
    var token: MyWorldToken;
    it("token deploy, stop and locktransfer test ", async function () {
        const MyWorldtokenFactory = await ethers.getContractFactory("MyWorldToken");
        token = await MyWorldtokenFactory.deploy({ gasLimit: 3000000 });
        await token.deployed();

        console.log("deployed MyWorldToken : ", token.address);

        const supply = await token.totalSupply();
        expect(ethers.utils.formatEther(supply)).equal("2000000000.0");

        //test start , stop, transfer
        await failTest(token.connect(minter).stop());
        await token.stop();
        await failTest(token.transfer(minter.address, 1));

        await failTest(token.connect(minter).start());
        await token.start();
        await token.transfer(minter.address, ethers.utils.parseEther("1"));

        const balance = await token.balanceOf(minter.address);
        // console.log(balance.toString());
        expect(balance).eq(ethers.utils.parseEther("1"));

        //test transferWithLocked
        let release = Math.floor(Date.now() / 1000) + 20;
        var tx = await token.transferWithLocked(buyer.address, ethers.utils.parseEther("1"), release);
        await tx.wait();
        expect(await token.balanceOf(buyer.address)).eq(ethers.utils.parseEther("1"));
        expect(await token.getLockedBalance(buyer.address)).eq(ethers.utils.parseEther("1"));

        release = Math.floor(Date.now() / 1000) + 10;
        tx = await token.transferWithLocked(buyer.address, ethers.utils.parseEther("1"), release);
        expect(await token.balanceOf(buyer.address)).eq(ethers.utils.parseEther("2"));
        let locked = await token.getLockedBalance(buyer.address);
        expect(locked).eq(ethers.utils.parseEther("2"));
        await failTest(token.connect(buyer).transfer(minter.address, ethers.utils.parseEther("1")));

        let sleep = 2000;
        await timeout(sleep);

        await token.connect(buyer).transfer(minter.address, ethers.utils.parseEther("1"));
        expect(await token.balanceOf(buyer.address)).eq(ethers.utils.parseEther("1"));
        locked = await token.getLockedBalance(buyer.address);
        expect(locked).eq(ethers.utils.parseEther("1"));

        sleep = 5000;
        await timeout(sleep);

        //test blacklist , removeFromBlacklist
        await failTest(token.connect(minter).blackList(buyer.address));
        await token.blackList(buyer.address);
        await failTest(token.blackList(buyer.address));

        await failTest(token.connect(buyer).transfer(minter.address, ethers.utils.parseEther("1")));

        await failTest(token.connect(minter).removeFromBlacklist(buyer.address));
        await token.removeFromBlacklist(buyer.address);
        await failTest(token.removeFromBlacklist(buyer.address));

        await token.connect(buyer).transfer(minter.address, ethers.utils.parseEther("1"));
    });

    it("locktransfer test ", async function () {
        let release = Math.floor(Date.now() / 1000) + 18;
        var tx = await token.transferWithLocked(buyer.address, ethers.utils.parseEther("7"), release);
        let locked = await token.getLockedBalance(buyer.address);
        console.log(ethers.utils.formatEther(locked));
        await timeout(2000);

        release = Math.floor(Date.now() / 1000) + 19;
        await token.transferWithLocked(buyer.address, ethers.utils.parseEther("6"), release);
        locked = await token.getLockedBalance(buyer.address);
        console.log(ethers.utils.formatEther(locked));


        release = Math.floor(Date.now() / 1000) + 25;
        await token.transferWithLocked(buyer.address, ethers.utils.parseEther("5"), release);
        locked = await token.getLockedBalance(buyer.address);
        console.log(ethers.utils.formatEther(locked));

        release = Math.floor(Date.now() / 1000) + 24;
        await token.transferWithLocked(buyer.address, ethers.utils.parseEther("4"), release);
        locked = await token.getLockedBalance(buyer.address);
        console.log(ethers.utils.formatEther(locked));

        release = Math.floor(Date.now() / 1000) + 23;
        await token.transferWithLocked(buyer.address, ethers.utils.parseEther("3"), release);
        locked = await token.getLockedBalance(buyer.address);
        console.log(ethers.utils.formatEther(locked));

        release = Math.floor(Date.now() / 1000) + 22;
        await token.transferWithLocked(buyer.address, ethers.utils.parseEther("2"), release);
        locked = await token.getLockedBalance(buyer.address);
        console.log(ethers.utils.formatEther(locked));

    });
});
