const { network } = require("hardhat");
const {developmentChains} = require("../helper-hardhat-config")
let DECIMALS=8,INITIAL_ANSWER=200000000000
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  let { deploy, log } = deployments;
  let { deployer } = await getNamedAccounts();
//   let chainId=network.config.chainId
//   const ethUsdPriceFeedAddress=networkConfig[chainId]['ethUsdPriceFeed']
 if(developmentChains.includes(network.name)){  
     log('local network detected! Deploying mocks... ')
     await deploy("MockV3Aggregator",{
         contract:"MockV3Aggregator",
         from:deployer,
         log:true,
         args:[DECIMALS,INITIAL_ANSWER]
     })
     log("MOCKS deployed")
     log("----------------------------------------------")
 }
};
module.exports.tags=["all","mocks"]
