import { ethers } from "hardhat";
import { BuyMeACoffee } from "../typechain-types";

// Returns the Ether balance of a given address
async function getBalance(address: string) {
  const balanceBigInt = await ethers.provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses
async function printBalances(addresses: string[]) {
  let index = 0;
  for (const address of addresses) {
    console.log(`Address ${index} balance: `, await getBalance(address));
    index++;
  }
}

// Logs the memos stored on-chain from the coffee purchases
async function printMemos(memos: BuyMeACoffee.MemoStructOutput[]) {
  for (const { timestamp, name, from, message } of memos) {
    console.log(`At ${timestamp}, ${name} (${from}) said: "${message}"`);
  }
}

async function main() {
  // Get example accounts
  const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();

  // Get the contract to deploy
  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");

  // Deploy the contract
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to", buyMeACoffee.address);

  // Check balances before the coffee purchase
  console.log("=== start ===");
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  await printBalances(addresses);

  // Buy the owner a few coffees
  const tip = { value: ethers.utils.parseEther("1") };
  await buyMeACoffee
    .connect(tipper)
    .buyCoffee("Carolina", "You're the best", tip);
  await buyMeACoffee
    .connect(tipper2)
    .buyCoffee("Vitto", "What an amazing teacher", tip);
  await buyMeACoffee
    .connect(tipper3)
    .buyCoffee("Kay", "I love my Proof of Knowledge NFT", tip);

  // Check balances after coffee purchase
  console.log("=== bought coffee ===");
  await printBalances(addresses);

  // Withdraw funds
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balances after withdraw
  console.log("=== withdraw tips ===");
  await printBalances(addresses);

  // Read all the memos left for the owner
  console.log("=== memos ===");
  const memos = await buyMeACoffee.connect(owner).getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
