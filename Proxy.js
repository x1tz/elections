const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const Web3 = require('web3');


var list = []
var clock = false;
var timedout = false;

var processOpen = true;

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

async function send_to_proxy(vote){
    list.push(vote);
    console.log("Proxy: Vote added to proxy.");

}

async function Stop(){
    stop=true;
}

async function send_to_network(contractWithSigner, vote){
    console.log("Entered send_to_network");

    const tx = await contractWithSigner.addVote(vote);
    // verify the updated value
    await tx.wait();
    // const res = await contract.get();
    // console.log("Obtained value at deployed contract is: "+ res);
    return tx;
}

function shuffle(list) {
  const shuffledList = list.slice();
  //const seed = Date.now(); //Get current timestamp for seeding
  //Math.seedrandom(seed.toString()); //Seed the random number generator

  for (let i = shuffledList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index between 0 and i
    [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]]; // Swap elements
  }
  return shuffledList;
}

function sendMessageToMain(data) {
  if (process.send) {
    process.send(data);
  } else {
    console.error("No parent process to send message to.");
  }
}

function timerOn(){
  timedout = true;
}

function resetTimer(){
  timedoutid = setTimeout(timerOn, 40000);
  clock=true;
  return timedoutid;
}

async function processVotes(contractWithSigner){
  list = shuffle(list);
  const votesToSend = list.splice(0, list.length);
  for(let i=0; i<votesToSend.length;i++){
      const tx = await send_to_network(contractWithSigner, votesToSend[i]);
      await tx.wait();
      console.log("Proxy: Registered vote:", tx); // Log the sent transactions
  }
  
}

async function main(){
  //Find SmartContract Address
  const sc_address = await find_SC_Adress();

  const contract = new ethers.Contract(sc_address, contractAbi, provider);
  const contractWithSigner = contract.connect(wallet);

  var timeoutId = resetTimer(); //timedout=true

  //add vote to list
  process.on("message", (msg) => {
    send_to_proxy(msg.vote);
  });
  
  //TIMERS
  //x em x segundos verifica nr votos
  setInterval(() => {
    if(list.length >=3 && processOpen){
      processOpen=false;
      clearTimeout(timeoutId);
      processVotes(contractWithSigner);
      processOpen=true;
      timeoutId = resetTimer();
    }
    else if(timedout){
      if(list.length > 0 && processOpen){
        console.log("Proxy: Timedout, emptying votes list...")
        processOpen = false;
        processVotes(contractWithSigner);
        processOpen=true;
      }
      timedout=false;
      timeoutId=resetTimer(); 
    }
  }, 2000);
  //Variavel clock inutil?

}

if (require.main === module) {
  main();
}

module.exports = exports = main
module.exports.send_to_proxy = send_to_proxy;
module.exports.Stop = Stop;
