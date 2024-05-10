const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const { register } = require('module');
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

const deployedContractAddress = "0xBca0fDc68d9b21b5bfB16D784389807017B2bbbc"

async function getVotesLength(provider, deployedContractAbi, deployedContractAddress){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const res = await contract.getVotesLength();
  console.log("Votes list length: "+ res);
  return res
}

async function getIdsLength(provider, deployedContractAbi, deployedContractAddress){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const res = await contract.getIdsLength();
  console.log("Ids list length: "+ res);
  return res
}




// You need to use the accountAddress details provided to Quorum to send/interact with contracts
async function registerVoteAtAddress(provider, wallet, deployedContractAbi, deployedContractAddress, vote){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const contractWithSigner = contract.connect(wallet);
  const tx = await contractWithSigner.addVote(vote);
  // verify the updated value
  await tx.wait();
  // const res = await contract.get();
  // console.log("Obtained value at deployed contract is: "+ res);
  return tx;
}

async function registerIdAtAddress(provider, wallet, deployedContractAbi, deployedContractAddress, id){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const contractWithSigner = contract.connect(wallet);
  const tx = await contractWithSigner.addId(id);
  // verify the updated value
  await tx.wait();
  // const res = await contract.get();
  // console.log("Obtained value at deployed contract is: "+ res);
  return tx;
}



async function main(){
  var vote = 1;
  var id = "Hugo" 

  const provider = new ethers.JsonRpcProvider(host);
  const wallet = new ethers.Wallet(accountPrivateKey, provider);

    
    console.log("Read the current contract's Votes list length .. " )
    await getVotesLength(provider, contractAbi, deployedContractAddress);
    console.log("Read the current contract's Ids list length .. " )
    await getIdsLength(provider, contractAbi, deployedContractAddress);

    //TODO: Read from console ID and Vote... HERE -------------------------------------------

    console.log("addId() function to register the id... " );
    await registerIdAtAddress(provider, wallet, contractAbi, deployedContractAddress, id);
    console.log("addVote() function to register the vote... " );
    await registerVoteAtAddress(provider, wallet, contractAbi, deployedContractAddress, vote);


    console.log("Verify the value was registered in the list .. " )
    console.log("Read the current contract's Votes list length .. " )
    await getVotesLength(provider, contractAbi, deployedContractAddress);
    console.log("Read the current contract's Ids list length .. " )
    await getIdsLength(provider, contractAbi, deployedContractAddress);
    // await getAllPastEvents(host, contractAbi, tx.contractAddress);

}

if (require.main === module) {
  main();
}

module.exports = exports = main