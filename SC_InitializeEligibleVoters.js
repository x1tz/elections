const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const Web3 = require('web3');
const others = require('./Others.js');

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const { register } = require('module');
const { exec } = require('child_process');
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

async function initializeEligibleVoters(contractWithSigner, namesList){
  const tx = await contractWithSigner.initializeVotersList(namesList);
  // verify the updated value
  await tx.wait();
  // const res = await contract.get();
  // console.log("Obtained value at deployed contract is: "+ res);
  console.log("List of voters initialized!");
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

function writeTimeToFile(functionName, executionTime, filename) {
  const data = `${functionName}, ${executionTime}\n`;
  fs.appendFileSync(filename, data);
}

async function main(){

  const provider = new ethers.JsonRpcProvider(host);
  const wallet = new ethers.Wallet(accountPrivateKey, provider);
  const sc_address = await find_SC_Adress();
  const contract = new ethers.Contract(sc_address, contractAbi, provider);

  //for (let i = 0; i < 250; i++) {
    // TIMESTAMP - 1
    const startTime = performance.now();
    
    const filename = 'VotersIds.txt'; 
    const namesList = readNamesFromFile(filename);
    //console.log(namesList);

    
    const contractWithSigner = contract.connect(wallet);

    const status = await others.getCurrentStatus(contractWithSigner);
    console.log("Status: " + status);

    await initializeEligibleVoters(contractWithSigner, namesList);

    // TIMESTAMP - 2
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    //console.log(executionTime);
    //writeTimeToFile('SC_InitializeEligibleVoters.js', executionTime, "sc_InitializeEligibleVoters.csv");
  //}
}

if (require.main === module) {
  main();
}

module.exports = exports = main