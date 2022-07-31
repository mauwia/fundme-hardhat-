let run = require("hardhat");
async function verify(contractAddress, args) {
  console.log("verify");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArgsParams: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("already verified");
    } else {
      console.log(error);
    }
  }
}
module.exports = { verify };
