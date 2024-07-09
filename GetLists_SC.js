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

const deployedContractAddress = "0xBca0fDc68d9b21b5bfB16D784389807017B2bbbc"; // Replace with actual address of SC

async function getVotesList(provider, deployedContractAbi, deployedContractAddress){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const res = await contract.getVotesList();
  const len = await contract.getVotesLength();
  console.log("List is: "+ res);
  console.log("Length: ", len);
  return res
}

async function getIdsList(provider, deployedContractAbi, deployedContractAddress){
    const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
    const res = await contract.getIdsList();
    const len = await contract.getIdsLength();
    console.log("List is: "+ res);
    console.log("Length: ", len);
    return res
  }


async function main(){
  const provider = new ethers.JsonRpcProvider(host);
  const wallet = new ethers.Wallet(accountPrivateKey, provider);

    try{
    //console.log("Use the smart contracts 'get' function to get the list of votes .. " )
    await getVotesList(provider, contractAbi, deployedContractAddress);

    //console.log("Use the smart contracts 'get' function to get the list of ids .. " )
    await getIdsList(provider, contractAbi, deployedContractAddress);
    }catch(error){
      console.log(error)
      console.error("ERROR: Cannot access lists, SC status is not 'Couting'!");
    }
    // await getAllPastEvents(host, contractAbi, tx.contractAddress);

}

if (require.main === module) {
  main();
}

module.exports = exports = main