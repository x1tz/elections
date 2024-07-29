const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const performance = require('perf_hooks').performance;

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const { register } = require('module');
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

// abi and bytecode generated from electionsSC.sol:
// > solcjs --bin --abi electionsSC.sol
const contractJsonPath = path.resolve(__dirname, '../../','contracts','electionsSC.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;
const contractBytecode = contractJson.data.bytecode.object

async function createContract(provider, wallet, contractAbi, contractByteCode) {
  const factory = new ethers.ContractFactory(contractAbi, contractByteCode, wallet);
  const contract = await factory.deploy();
  // The contract is NOT deployed yet; we must wait until it is mined
  const deployed = await contract.waitForDeployment();
  //The contract is deployed now
  return contract
};

function writeTimeToFile(functionName, executionTime, filename) {
  const data = `${executionTime}\n`;
  fs.appendFileSync(filename, data);
}

async function main(){
  const provider = new ethers.JsonRpcProvider(host);
  const wallet = new ethers.Wallet(accountPrivateKey, provider);

  // LOOP FOR PROFILING
  //for (let i = 0; i < 500; i++) {
  try {

    // TIMESTAMP - TODO 1
    const startTime = performance.now();

    const contract = await createContract(provider, wallet, contractAbi, contractBytecode);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("Contract deployed at address: " + contractAddress);

    // TIMESTAMP - TODO 2
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log(executionTime);
    //writeTimeToFile("sc_deploy", executionTime, "sc_deploy.csv");

  } catch (error) {
    console.error('Error deploying contract:', error);
  }
//}
}
  

if (require.main === module) {
  main();
}

module.exports = exports = main