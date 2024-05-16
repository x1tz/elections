const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');

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

const deployedContractAddress = "0xBca0fDc68d9b21b5bfB16D784389807017B2bbbc"

async function initializeEligibleVoters(provider, wallet, deployedContractAbi, deployedContractAddress, namesList){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const contractWithSigner = contract.connect(wallet);
  const tx = await contractWithSigner.initializeVotersList(namesList);
  // verify the updated value
  await tx.wait();
  // const res = await contract.get();
  // console.log("Obtained value at deployed contract is: "+ res);
  return tx;
}

// Function to read names from a text file and put them into a list
function readNamesFromFile(filename) {
  try {
      // Read the content of the file
      const data = fs.readFileSync(filename, 'utf8');
      
      // Split the content into an array of names
      const namesArray = data.split('\n');
      
      // Remove any empty elements from the array
      const filteredNames = namesArray.filter(name => name.trim() !== '');

      return filteredNames;
  } catch (err) {
      console.error('Error reading file:', err);
      return [];
  }
}


async function main(){
  const provider = new ethers.JsonRpcProvider(host);
  const wallet = new ethers.Wallet(accountPrivateKey, provider);

  const filename = 'VotersIds.txt'; 
  const namesList = readNamesFromFile(filename);
  console.log(namesList);
  initializeEligibleVoters(provider, wallet, contractAbi, deployedContractAddress, namesList);
}

if (require.main === module) {
  main();
}

module.exports = exports = main