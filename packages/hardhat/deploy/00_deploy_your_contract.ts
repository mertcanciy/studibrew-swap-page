import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("StuBrew", {
    from: deployer,
    // Contract constructor arguments
    //args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const stuBrewcontract = await hre.ethers.getContract("StuBrew", deployer);


  await deploy("StudiBrewDEX", {
    from: deployer,
    // Contract constructor arguments
    args: [stuBrewcontract.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });


 const studiBrewDEXcontract = await hre.ethers.getContract("StudiBrewDEX", deployer);
 await stuBrewcontract.transfer(
  "0x4aDc44E492aBfAbBcB306575a0edDCE3ca06Cb47",
  "" + 10 * 10 ** 18
);

  // If you are going to the testnet make sure your deployer account has enough ETH
  await stuBrewcontract.approve(studiBrewDEXcontract.address, hre.ethers.utils.parseEther("100"));
  await studiBrewDEXcontract.init(hre.ethers.utils.parseEther("50"), {
    value: hre.ethers.utils.parseEther("50"),
    gasLimit: 200000,
  });

};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["StuBrew", "StudiBrewDEX"];