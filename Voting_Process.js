const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const Web3 = require('web3');
const axios = require('axios'); // Import axios
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

// Searches and finds Deployed Smart Contract Adress
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

// Returns SC Votes List Length
async function getVotesLength(provider, deployedContractAbi, deployedContractAddress){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const res = await contract.getVotesLength();
  console.log("Votes list length: "+ res);
  return res
}

// Returns SC IDs List Length
async function getIdsLength(provider, deployedContractAbi, deployedContractAddress){
  const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
  const res = await contract.getIdsLength();
  console.log("Ids list length: "+ res);
  return res
}

// Sends vote data to "Proxy" (child process)
async function registerVoteAtAddress(child, data){
  child.send({vote: data});
}

// Adds ID to SC Ids List (transaction is registered on blockchain)
async function registerIdAtAddress(contractWithSigner, id){
  const tx2 = await contractWithSigner.addId(id);
  await tx2.wait();
  return tx2;
}

// Read and Parse text from a .txt file
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

// Main Function
async function main(){

  var loop = true;

  // Find SmartContract Address
  const sc_address = await find_SC_Adress();
  console.log("Found SC Address:" + sc_address);

  // Read from test votes file logic
  const readFile = readAndParseTxtFile("VotesTest.txt");
  const ids = readFile[0];
  const votes = readFile[1];

  // Smart Contrac with Signer
  const contract = new ethers.Contract(sc_address, contractAbi, provider);
  const contractWithSigner = contract.connect(wallet);

  // "Turn ON" Proxy asynchronously
  // Child Process Logic
  const child = fork("./Proxy.js"); // Fork the worker process 

  child.on("message", (msg) => {
    console.log("Message from child:", msg);
  });
  child.on("error", (err) => {
    console.error("Child process error:", err);
  });


  // Change Contract Status to Voting
  const tx_status = await others.statusToVoting(contractWithSigner);
  await tx_status.wait();
  console.log("Status: " + tx_status.toString());

  // Loop to receive votes from FastAPI
  var sent_stop_to_child = false;
  child.on("close", (code) => {
    console.log("Child process exited with code:", code);
    loop = false;
  });

  // Loop forVoting Process
  while (loop) {

    // Get request for status of STOP signal
    const stop_state = await axios.get('http://localhost:8000/api/stop');
    
    if(stop_state.data && !sent_stop_to_child){
      child.send("stop");
      console.log("STOP: Proxy will shutdown after processing votes...");
      sent_stop_to_child = true;
    }
    try {
      // Replace with your actual FastAPI endpoint URL and path
      const response = await axios.get('http://localhost:8000/api/votes');
      const votes = response.data; // Access vote data from response
      if(votes.length > 0 ){
          const vote = votes[0];
          await axios.put('http://localhost:8000/api/votes'); //remove vote from fastapi 
          var id = vote.id; // Assuming vote object has an "id" property
          var canVote = false;
          try {
            canVote = await registerIdAtAddress(contractWithSigner, id);
          } catch(error){
            console.error("ERROR: Voter ID is not eligible to vote...");
          }
          if(canVote){
            await registerVoteAtAddress(child, vote.choice); // Assuming vote object has a "choice" property
          }
          //await axios.put('http://localhost:8000/api/votes'); //remove vote from list
      }
      //console.log("Stop State: ", stop_state.data);
    } catch (error) {
      console.error("Error fetching votes from FastAPI:", error);
    }

    // Adjust sleep time based on your requirements (e.g., milliseconds)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // ... (code to execute on shutdown - optional)

  //Send STOP message to child
  //child.kill("SIGTERM");
  //console.log("Proxy stopped..."); 
}

if (require.main === module) {
  main();
}

module.exports = exports = main