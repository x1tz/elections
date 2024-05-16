const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const Web3 = require('web3');
const proxy = require('./Proxy.js');

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

// Create a Web3 instance connected to your node
const web3 = new Web3(new Web3.providers.HttpProvider(host));


//const deployedContractAddress = "0xBca0fDc68d9b21b5bfB16D784389807017B2bbbc"

async function find_SC_Adress(){
  const blockNumber = await web3.eth.getBlockNumber(); //Get most recent block number
  var foundSC = false;
  var tx_hash=0;
  for(let k = 0; k <= blockNumber; k++){
    const block = await web3.eth.getBlock(k); //Get block object by number
    const hash = block.hash;
    const numberTx = await web3.eth.getBlockTransactionCount(hash);

    if(numberTx > 0){
      for(let i = 0; i < numberTx; i++){
        const txfound = await web3.eth.getTransactionFromBlock(hash, i);
        //console.log("found TX" + txfound);
        if(txfound.to === null){
          tx_hash = txfound.hash;
          //console.log(tx_hash);
          foundSC = true;
        }
      }
    }
    if(foundSC){
      break;
    }
  }
  const receipt = await web3.eth.getTransactionReceipt(tx_hash);
  return receipt.contractAddress;
}

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
async function registerVoteAtAddress(vote){
    await proxy.send_to_proxy(vote);
}

async function registerIdAtAddress(provider, wallet, deployedContractAbi, deployedContractAddress, id){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const contractWithSigner = contract.connect(wallet);

  const tx1 = await contractWithSigner.checkId(id);
  if(tx1 == 1){
    console.log("ID Eligible: Accepted");
    const tx2 = await contractWithSigner.addId(id);
    await tx2.wait();
    return true;
  }
  else if(tx1 == 0){
    console.log("Voter ID is not eligible")
    return false;
  } 
  else if (tx1 == 2){}
    //const tx2 = await contractWithSigner.addId(id);
    // verify the updated value
    //await tx2.wait();
    console.log("User already voted!");
    return false;
}

function readAndParseTxtFile(filePath) {
  try {
      const data = fs.readFileSync(filePath, 'utf8');
      const lines = data.split('\n');
      // Variables to store IDs and numbers
      const ids = [];
      const numbers = [];
      lines.forEach(line => {
          const [id, number] = line.trim().split(',');
          // Add ID and number to respective arrays
          ids.push(id);
          numbers.push(parseInt(number));
      });
      return { ids, numbers };
  } catch (err) {
      console.error('Error reading or parsing the file:', err);
      return { ids: [], numbers: [] };
  }
}



async function main(){

    const sc_address = await find_SC_Adress();
    console.log("Found SC Address:" + sc_address);

    const provider = new ethers.JsonRpcProvider(host);
    const wallet = new ethers.Wallet(accountPrivateKey, provider);

    //IDS & Votes Examples
    const ids = ["hugo","paulo","dino","vinicius","joao"]; //,"guilherme","ana","jose","ines","beatriz" podem ou nao ser iguais aos autorizados
    const votes= [1,2,3,1,1];

    //"Turn ON" Proxy 
    proxy.Start(sc_address, contractAbi, provider, wallet);

    for(let i=0; i<ids.length;i++){
      var vote = votes[i];
      var id = ids[i];


      //TODO: Read from console ID and Vote... HERE -------------------------------------------
      // Postman??

      console.log("addId() function to register the id... " );
      const canVote = await registerIdAtAddress(provider, wallet, contractAbi, sc_address, id);
      console.log("addVote() function to register the vote... " );
      if(canVote){
        registerVoteAtAddress(vote);
      }
      


      //console.log("Verify the value was registered in the list .. " )
      //console.log("Read the current contract's Votes list length .. " )
      await getVotesLength(provider, contractAbi, sc_address);
      //console.log("Read the current contract's Ids list length .. " )
      await getIdsLength(provider, contractAbi, sc_address);
      // await getAllPastEvents(host, contractAbi, tx.contractAddress);
    }
  proxy.Stop();
  console.log("Proxy stopped...");
}

if (require.main === module) {
  main();
}

module.exports = exports = main