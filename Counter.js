const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const Web3 = require('web3');
const fetchTxs = require('./FetchAllTransactions.js');
const others = require('./Others.js');

const contractJsonPath = path.resolve(__dirname, '../../','contracts','electionsSC.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const { register } = require('module');
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

const provider = new ethers.JsonRpcProvider(host);
const wallet = new ethers.Wallet(accountPrivateKey, provider);

// Create a Web3 instance connected to your node
const web3 = new Web3(new Web3.providers.HttpProvider(host));

const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(contractAbi);

var votes =[];

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

function readNamesFromFile(filename) {
  const names = [];
  try {
    const data = fs.readFileSync(filename, 'utf-8');
    names.push(...data.split(/\r?\n/));
  } catch (error) {
    console.error("Error reading file:", error);
  }

  return names;
}

function findResults(votes, candidates) {
    // Create a dictionary to store the vote counts
    const voteCounts = { "Blank Vote": 0 };
    for (const candidate of candidates) {
      voteCounts[candidate] = 0;
    }
  
    // Count the votes for each valid candidate
    for (const vote of votes) {
      if (vote >= 1 && vote <= candidates.length) {
        voteCounts[candidates[vote - 1]] += 1;
      } else {
        voteCounts["Blank Vote"] += 1;
      }
    }
    return voteCounts;
}
  
async function countVotes(){
    txList = await fetchTxs.getAllTransactions();
    
    for(let i=0; i<txList.length;i++){
        const decoded = decoder.decodeData(txList[i].input);
        if(decoded.method == "addVote"){
            votes.push(decoded.inputs[0].toNumber());
        }
    }
    const candidates = readNamesFromFile("Candidates.txt");
    const results = findResults(votes, candidates);
    console.log(results);

    return results; //format [{candidate: 1, count: 3}, {candidate: 2, count: 2}, etc...]
}

async function main(){
  const sc_address = await find_SC_Adress();
  const contract = new ethers.Contract(sc_address, contractAbi, provider);
  const contractWithSigner = contract.connect(wallet);

  // Change SC Status to Counting
  const tx_status = await others.statusToCounting(contractWithSigner);
  await tx_status.wait();
  console.log("Status -> " + tx_status.toString());

  // Count Votes & Print Results
  countVotes();
}

if (require.main === module) {
main();
}

module.exports.countVotes = countVotes;
module.exports = exports = main
