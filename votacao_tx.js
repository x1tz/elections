const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const { register } = require('module');
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

const deployedContractAddress = "0xBca0fDc68d9b21b5bfB16D784389807017B2bbbc"


// abi and bytecode generated from electionsSC.sol:
// > solcjs --bin --abi electionsSC.sol
const contractJsonPath = path.resolve(__dirname, '../../','contracts','electionsSC.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;
const contractBytecode = contractJson.data.bytecode.object

//Vote String
var vote = "Candidate A";

async function getListLength(provider, deployedContractAbi, deployedContractAddress){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const res = await contract.getListLength();
  console.log("Obtained current list length at deployed contract is: "+ res);
  return res
}


// You need to use the accountAddress details provided to Quorum to send/interact with contracts
async function registerVoteAtAddress(provider, wallet, deployedContractAbi, deployedContractAddress, vote){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const contractWithSigner = contract.connect(wallet);
  const tx = await contractWithSigner.addItem(vote);
  // verify the updated value
  await tx.wait();
  // const res = await contract.get();
  // console.log("Obtained value at deployed contract is: "+ res);
  return tx;
}


async function main(){
  const provider = new ethers.JsonRpcProvider(host);
  const wallet = new ethers.Wallet(accountPrivateKey, provider);

    console.log("Contract deployed at address: " + deployedContractAddress);
    console.log("Use the smart contracts 'get' function to read the current contract's list length .. " )
    await getListLength(provider, contractAbi, deployedContractAddress);
    console.log("Use the smart contracts 'addItem' function to register the vote... " );
    await registerVoteAtAddress(provider, wallet, contractAbi, deployedContractAddress, vote);
    console.log("Verify the value was registered in the list .. " )
    await getListLength(provider, contractAbi, deployedContractAddress);
    // await getAllPastEvents(host, contractAbi, tx.contractAddress);

}

if (require.main === module) {
  main();
}

module.exports = exports = main