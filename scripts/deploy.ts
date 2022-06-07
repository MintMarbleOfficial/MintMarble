// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { MyWorldToken } from "../typechain/MyWorldToken";

async function main() {
    var token: MyWorldToken;
    const MyWorldtokenFactory = await ethers.getContractFactory("MyWorldToken");
    token = await MyWorldtokenFactory.deploy();
    //0xC225CCBcdE0344bE003792A652629Bd697C23d71//bsc
    //0xE00DeC05D7601D4a3729B03e451CcD9bc63a4B7e//poly
    // token = await ethers.getContractAt("MyWorldToken", "0xfC951FEe5b5E9032416e18b251F61d4E8B1CD53A");//testnet
    await token.deployed();

    console.log("deployed MyWorldToken : ", token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
