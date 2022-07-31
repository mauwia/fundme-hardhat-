const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
describe("fundme", async () => {
  let fundme;
  let deployer;
  let mockV3Aggregator;
  let sendValue = ethers.utils.parseEther("1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundme = await ethers.getContract("fundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  describe("constructor", async () => {
    it("sets the aggregator address correctly", async () => {
      let response = await fundme.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
  describe("fund", async () => {
    it("Fails if you don't send enough ETH", async () => {
      await expect(fundme.fund()).to.be.revertedWith("Didn't send enough");
    });
    it("updated the amount funded data structure", async () => {
      await fundme.fund({ value: sendValue });
      const response = await fundme.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("Add funders to array of funders", async () => {
      await fundme.fund({ value: sendValue });
      const funder = await fundme.funders(0);
      assert.equal(funder, deployer);
    });
  });
  describe("withdraw", async () => {
    beforeEach(async () => {
      await fundme.fund({ value: sendValue });
    });
    it("withdraw eth from a single founder", async () => {
      const startingFundmeAddress = await fundme.provider.getBalance(
        fundme.address
      );
      const startingDeployerBalance = await fundme.provider.getBalance(
        deployer
      );
      const tx = await fundme.withdraw();
      const txReceipt = await tx.wait(1);
      let { gasUsed, effectiveGasPrice } = txReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundmeAddress = await fundme.provider.getBalance(
        fundme.address
      );
      const endingdeployerAddress = await fundme.provider.getBalance(deployer);
      assert.equal(endingFundmeAddress, 0);
      assert.equal(
        startingDeployerBalance.add(startingFundmeAddress).toString(),
        endingdeployerAddress.add(gasCost).toString()
      );
    });
    it("withdraw eth with multiple funder", async () => {
      let accounts = await ethers.getSigners();
      console.log(accounts);
      for (i = 1; i < 6; i++) {
        let fundMeConnectedContract = await fundme.connect(accounts[i]);
        fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundmeAddress = await fundme.provider.getBalance(
        fundme.address
      );
      const startingDeployerBalance = await fundme.provider.getBalance(
        deployer
      );
      const tx = await fundme.withdraw();
      const txReceipt = await tx.wait(1);
      let {gasUsed,effectiveGasPrice}=txReceipt
      const gasCost=gasUsed.mul(effectiveGasPrice)
      const endingFundmeAddress = await fundme.provider.getBalance(
        fundme.address
      );
      const endingdeployerAddress = await fundme.provider.getBalance(deployer);
      assert.equal(endingFundmeAddress, 0);
      assert.equal(
        startingDeployerBalance.add(startingFundmeAddress).toString(),
        endingdeployerAddress.add(gasCost).toString()
      );
      await expect(fundme.funders(0)).to.be.reverted
      for (i = 1; i < 6; i++) {
            assert.equal(await fundme.addressToAmountFunded(accounts[i].address))
      }
    });
  });
});
