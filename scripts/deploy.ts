import { ethers } from "hardhat";

// This contract has been deployed to Goerli at 0x47EfF0c3fd2AC83704930E838ED4426d56882E61

async function main() {
  // Get the contract and deploy it
  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to", buyMeACoffee.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
