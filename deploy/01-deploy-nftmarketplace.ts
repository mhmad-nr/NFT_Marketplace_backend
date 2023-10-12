import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { VERIFICATION_BLOCK_CONFIRMATIONS, developmentChains } from "../helper-hardhat-config"
import { verify } from '../utils/verify';
import updateFrontEnd from '../utils/03-update-frontend';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();


  log("----------------------------------------------------------------")

  const waitConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS
  const args: any[] = []

  const buyMeACoffee = await deploy('NftMarketplace', {
    from: deployer,
    log: true,
    args,
    waitConfirmations,
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(buyMeACoffee.address, args)
  }

  await updateFrontEnd('NftMarketplace', buyMeACoffee.abi, buyMeACoffee.address)

  log("----------------------------------------------------------------")

};
func.tags = ["all", 'NftMarketplace'];
export default func;