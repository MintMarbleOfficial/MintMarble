import { expect } from "chai";
import { ethers, waffle } from "hardhat";
const address_zero = "0x0000000000000000000000000000000000000000";

const provider = waffle.provider;
const accounts = provider.getWallets();
const owner = accounts[0];
const minter = accounts[1];
const buyer = accounts[2];
const receiver = accounts[3];
const signer = accounts[4];

var testfailed = false;
function catchlog(reason: any) {
    testfailed = true;
    // console.error(reason);
}

async function failTest(test: any) {
    testfailed = false;
    await test.catch(catchlog);
    expect(testfailed).equal(true);
}

export { address_zero, catchlog, provider, accounts, owner, minter, buyer, receiver, signer, failTest };
