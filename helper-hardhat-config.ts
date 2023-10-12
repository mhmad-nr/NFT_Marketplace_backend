
const networkConfig = {
    default: {
        name: "hardhat",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6

export const frontEndContractsFile = "../nextjs-nft-marketplace-moralis/constants/networkMapping.json"
export const frontEndAbiLocation = "../NFT_Marketplace_frontend/constants/"

export {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}