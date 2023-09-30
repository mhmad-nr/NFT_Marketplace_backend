import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox"
import 'hardhat-deploy'
import 'dotenv/config'


const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {

      chainId: 1337,

    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0,
    },
    player: {
      default: 1,
    },
  },
};

export default config;
