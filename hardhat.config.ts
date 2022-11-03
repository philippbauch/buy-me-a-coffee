import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const GOERLI_URL = process.env.GOERLI_URL;
if (typeof GOERLI_URL === "undefined") {
  throw new Error("Missing environment variable: GOERLI_URL");
}

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (typeof PRIVATE_KEY === "undefined") {
  throw new Error("Missing environment variable: PRIVATE_KEY");
}

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: GOERLI_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
