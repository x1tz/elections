const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const Web3 = require('web3');
const axios = require('axios'); // Import axios
const proxy = require('./Proxy.js');
const others = require('./Others.js');
const { fork } = require("child_process");
const performance = require('perf_hooks').performance;

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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Sends vote data to "Proxy" (child process)
async function registerVoteAtAddress(child, data){
  child.send({vote: data});
}

// Adds ID to SC Ids List (transaction is registered on blockchain)
async function registerIdAtAddress(contractWithSigner, id){
  try{
    const tx2 = await contractWithSigner.addId(id);
    await tx2.wait();
    return tx2;
  } catch(error){
    if(error.code == 'REPLACEMENT_UNDERPRICED'){
      console.log("Error Registering ID: Retrying...")
      sleep(1000);
      const tx2 = await registerIdAtAddress(contractWithSigner, id);
      await tx2.wait();
      return tx2;
    } else{
      console.log(error);
    }
  }
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

var crypto = require('crypto');

var algorithm = 'aes-256-cbc'; // or any other algorithm supported by OpenSSL

const keyHex = '0123456789abcdef0123456789abcdef';
//const key = Buffer.from(keyHex); sem o buffer se a funcao ja tiver  

// An encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  // Creating Cipheriv with its parameter
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(keyHex), iv);
  // Updating text
  let encrypted = cipher.update(text);
  // Using concatenation
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // Returning iv and encrypted data
  return {
      iv: iv.toString('hex'),
      encryptedData: encrypted.toString('hex')
  };
}

function writeTimeToFile(functionName, executionTime, filename) {
  const data = `${executionTime}\n`;
  fs.appendFileSync(filename, data);
}

// Main Function
async function main(){
  
  

  // TIMESTAMP 1
  const startTime1 = performance.now();

  // Find SmartContract Address
  const sc_address = await find_SC_Adress();
  console.log("Found SC Address:" + sc_address);

  //TIMESTAMP 2
  const endTime1 = performance.now();
  const executionTime = endTime1 - startTime1;
  console.log("Find SC: ", executionTime);
  //writeTimeToFile('find_SC_Adress', executionTime, "VP_Find_SC.csv");

  
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
  //for(i=0;i<500;i++){

  // TIMESTAMP - 1
  const startTime2 = performance.now();

  const tx_status = await others.statusToVoting(contractWithSigner);
  await tx_status.wait();
  console.log("Status: " + tx_status.toString());

  // TIMESTAMP - 2
  const endTime2 = performance.now();
  const executionTime2 = endTime2 - startTime2;
  console.log("Status: ", executionTime2);
  //writeTimeToFile('change_SC_status', executionTime2, "VP_ChangeStatus.csv");
  //}

  // Waits for exit signal from child, turns off loop (voting) after
  var sent_stop_to_child = false;
  child.on("close", (code) => {
    console.log("Child process exited with code:", code);
    console.log("Ending voting process...");
    process.exit()
  });

  // Connect to EventSource on API
  const EventSource = require('eventsource');
  const es = new EventSource('http://localhost:8000/events');


  let debug = 0;
  // Recieves msg from API events (vote & stop)
  es.onmessage = async function(event) {
    try {

      //TIMESTAMP - 1 (all vote process)
      const startTime5 = performance.now();

      const message = JSON.parse(event.data); // Parse the JSON string into an object
      console.log('Received Event:', message);
      if (message.type === "vote") {
        debug += 1;
        const vote = message.data;
        var id = vote.id;
        var canVote = false;
        try {
          console.log("DEBUG: ", debug);
          // TIMESTAMP - 1
          const startTime3 = performance.now();

          canVote = await registerIdAtAddress(contractWithSigner, id);
          console.log("ID teste tempo se espera a seguir canVote.wait() (RegistedIDatAddress)")
          await canVote.wait()
          // TIMESTAMP - 2
          const endTime3 = performance.now();
          const executionTime3 = endTime3 - startTime3;
          console.log("Register ID: ", executionTime3);
          writeTimeToFile('register_id_atAddress', executionTime3, "VP_RegisterID.csv");
          
        } catch(error){
          //console.error("ERROR: Voter ", id," is not eligible to vote...");
          console.log(error);
        }
        if(canVote){
          // TIMESTAMP - TODO 1
          const startTime4 = performance.now();

          // Encrypt vote
          v = vote.choice;
          const voteencrypt = encrypt(v.toString());
          //console.log("Vote Encrypted: ", voteencrypt);
          await registerVoteAtAddress(child, voteencrypt); // Assuming vote object has a "choice" property

          // TIMESTAMP - TODO 2
          const endTime4 = performance.now();
          const executionTime4 = endTime4 - startTime4;
          console.log("Encrypt & Register Vote: ", executionTime4);
          writeTimeToFile('encrypt_register_Vote', executionTime4, "VP_Encrypt_Send_Vote.csv");
        }

      } else if (message.type === "stop") {
        mess = JSON.parse(message.data);
        if(mess.is_stopped && !sent_stop_to_child){
          child.send("stop");
          console.log("STOP: Proxy will shutdown after processing votes...");
          sent_stop_to_child = true;
          
        }
      }

      // TIMESTAMP - 2 (all vote process)
      const endTime5 = performance.now();
      const executionTime5 = endTime5 - startTime5;
      console.log("All Vote: ", executionTime5);
      writeTimeToFile('all_vote_process', executionTime5, "VP_AllProcess.csv");
      
    } catch (error) {
      console.error('Failed to parse event data:', error);
    }
  };
  es.onerror = function(err) {
      console.error('EventSource failed:', err);
  };
}


if (require.main === module) {
  main();
}

module.exports = exports = main