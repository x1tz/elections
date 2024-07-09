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


// Decrypt function
function decrypt(ivHex, encryptedDataHex) {

  var crypto = require('crypto');
  var algorithm = 'aes-256-cbc'; // or any other algorithm supported by OpenSSL
  const keyHex = '0123456789abcdef0123456789abcdef';

  // Remove '0x' prefix and convert hexadecimal strings to Buffer
  const iv = Buffer.from(ivHex.slice(2), 'hex');  // Remove '0x' and convert to Buffer
  const encryptedData = Buffer.from(encryptedDataHex.slice(2), 'hex');  // Remove '0x' and convert to Buffer

  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(keyHex), iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
  
async function countVotes(){
    const votes =[];
    var txList = [];
    txList = await fetchTxs.getAllTransactions();
    
    for(let i=0; i<txList.length;i++){
        const decoded = decoder.decodeData(txList[i].input);
        if(decoded.method == "addVote"){
            decryptedVote = decrypt(decoded.inputs[0], decoded.inputs[1]);
            votes.push(decryptedVote);
        }
    }
    const candidates = readNamesFromFile("Candidates.txt");

    const results = findResults(votes, candidates);

    return results; //format [{candidate: 1, count: 3}, {candidate: 2, count: 2}, etc...]
}

function writeTimeToFile(functionName, executionTime, filename) {
  const data = `${functionName}, ${executionTime}\n`;
  fs.appendFileSync(filename, data);
}

async function main(){
  const sc_address = await find_SC_Adress();
  const contract = new ethers.Contract(sc_address, contractAbi, provider);
  const contractWithSigner = contract.connect(wallet);

  //LOOP
  for(i=0;i<500;i++){

    // TIMESTAMP - 1
    const startTime = performance.now();
    // Change SC Status to Counting
    const tx_status = await others.statusToCounting(contractWithSigner);
    await tx_status.wait();
    //const tx_status = await others.getCurrentStatus(contractWithSigner);
    console.log("Status -> " + tx_status.toString());
  
    const results = await countVotes();
    console.log(results);

    // TIMESTAMP - 2
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log("Decrypt & Count: ", executionTime);
    writeTimeToFile('sc_votes_decrypt_count', executionTime, "Counter.csv");
  }

  
}

if (require.main === module) {
main();
}

module.exports.countVotes = countVotes;
module.exports = exports = main
