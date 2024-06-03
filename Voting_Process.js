const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const Web3 = require('web3');
const proxy = require('./Proxy.js');
const others = require('./Others.js');
const { fork } = require("child_process");

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const { register } = require('module');
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

const provider = new ethers.JsonRpcProvider(host);
const wallet = new ethers.Wallet(accountPrivateKey, provider);

// abi and bytecode generated from electionsSC.sol:
// > solcjs --bin --abi electionsSC.sol
const contractJsonPath = path.resolve(__dirname, '../../','contracts','electionsSC.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;
const contractBytecode = contractJson.data.bytecode.object

// Create a Web3 instance connected to your node
const web3 = new Web3(new Web3.providers.HttpProvider(host));


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


// send_to_proxy checks for 3 votes when is called! 
async function registerVoteAtAddress(child, data){
  child.send({vote: data});
}

async function registerIdAtAddress(contractWithSigner, id){
  const tx2 = await contractWithSigner.addId(id);
  await tx2.wait();
  return tx2;
}

function readAndParseTxtFile(filename) {
  const names = [];
  const numbers = [];
  try {
    const data = fs.readFileSync(filename, 'utf-8');
    for (const line of data.split(/\r?\n/)) {
      const parts = line.trim().split(',');
      if (parts.length === 2) {
        names.push(parts[0]);
        numbers.push(parseInt(parts[1], 10)); // Parse string to number (base 10)
      } else {
        console.warn(`Skipping invalid line: ${line}`);
      }
    }
  } catch (error) {
    console.error("Error reading file:", error);
  }

  return [names, numbers];
}

async function main(){

    //Find SmartContract Address
    const sc_address = await find_SC_Adress();
    console.log("Found SC Address:" + sc_address);

    //Read from test votes file logic
    const readFile = readAndParseTxtFile("VotesTest.txt");
    const ids = readFile[0];
    const votes = readFile[1];

    //Smart Contrac with Signer
    const contract = new ethers.Contract(sc_address, contractAbi, provider);
    const contractWithSigner = contract.connect(wallet);

    // "Turn ON" Proxy asynchronously ####################################################################################
    //Child Process Logic
    const child = fork("./Proxy.js"); // Fork the worker process 

    child.on("message", (msg) => {
      console.log("Message from child:", msg);
    });
    child.on("error", (err) => {
      console.error("Child process error:", err);
    });
    child.on("close", (code) => {
      console.log("Child process exited with code:", code);
    });


    //Change Contract Status to Voting
    const tx_status = await others.statusToVoting(contractWithSigner);
    await tx_status.wait();
    console.log("Status: " + tx_status.toString());

    for(let i=0; i<ids.length;i++){
      var vote = votes[i];
      var id = ids[i];
      var canVote = false;
      try{
        canVote = await registerIdAtAddress(contractWithSigner, id);
      } catch(error){
        console.error("ERROR: Voter ID is not eligible to vote...");
      }
      //console.log("Can Vote? -> " + canVote);
      if(canVote){
        await registerVoteAtAddress(child, vote);
      }
    }
  
  //Send STOP message to child
  //child.kill("SIGTERM");
  //console.log("Proxy stopped..."); 
}

if (require.main === module) {
  main();
}

module.exports = exports = main