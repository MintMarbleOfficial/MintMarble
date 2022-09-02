// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

import { MintMarble } from "../typechain/MintMarble";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import Caver, { AbiItem, Contract, SingleKeyring } from "caver-js";
import { hashMessage } from "@ethersproject/hash";

import * as token_abi from "../artifacts/contracts/MintMarble.sol/MintMarble.json";
import { BigNumber } from "ethers";
const address_zero = "0x0000000000000000000000000000000000000000";
// We get the contract to deploy
let token: Contract;
let caver: Caver;
let keyring: SingleKeyring;

let tokenAddress = "";
let callOption = {};
let sendOption = {};
let network: any;
let validatorAddress = "";
async function deployOrLoadContract() {
    if (tokenAddress !== "") {
        token = new caver.contract(token_abi.abi as AbiItem[], tokenAddress);
    } else {
        token = new caver.contract(token_abi.abi as AbiItem[]);
        token = await token.deploy({ from: keyring.address, gas: 8000000 }, token_abi.bytecode).catch((err) => {
            console.error(err);
            throw new Error("token deploy error");
        });
    }
    console.log("token deployed to:", token._address);
}

async function main() {
    network = await ethers.provider.getNetwork();

    switch (network.chainId) {
        case 1001:
            tokenAddress = "0xB1fFE69E2eBACB91c84568D984CeFcAAC5114366";
            caver = new Caver(new Caver.providers.HttpProvider("http://172.30.1.191:8551/v1/klaytn/"));
            keyring = caver.wallet.keyring.createFromPrivateKey(JSON.parse(process.env.privatekeys as string)[0]); //baobab
            caver.wallet.add(keyring);

            break;
        case 8217: //cypress
            tokenAddress = "0x00d00B3dfd60aAa244DAE7d2343494800bDd7Ca9";
            caver = new Caver(new Caver.providers.HttpProvider("http://121.133.119.92:8551/v1/klaytn/"));
            keyring = caver.wallet.keyring.createFromPrivateKey(JSON.parse(process.env.privatekeys_main as string)[0]); //cypress
            caver.wallet.add(keyring);

            break;
        default:
            console.log(network);
            console.log("unknown network");
            return;
    }
    callOption = { gas: 100000, gasPrice: 250000000000 };
    sendOption = { from: keyring.address, gas: 100000 };
    await deployOrLoadContract();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
