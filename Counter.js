const path = require('path');
const fs = require('fs-extra');
const fetchTxs = require('./FetchAllTransactions.js');

const contractJsonPath = path.resolve(__dirname, '../../','contracts','electionsSC.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;

const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(contractAbi);

var votes =[];

function findResults(list) {
    if (!list || !list.length) {
      return []; // Handle empty list case
    }
    const counts = {};
    // Count occurrences of each element
    for (const candidate of list) {
      counts[candidate] = (counts[candidate] || 0) + 1;
    }
    // Convert counts to an array of [element, count] pairs
    const elementCounts = Object.entries(counts);
    // Sort the array by count (descending) and then by element (ascending for tiebreaker)
    elementCounts.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    // Extract elements with their corresponding frequencies
    return elementCounts.map(([candidate, count]) => ({ candidate, count }));
  }
async function printResults(results){
    console.log("Elections Results:");
    for(let i=0; i<results.length;i++){
        console.log("Candidate: "+results[i].candidate + ", Votes: " + results[i].count);
    }
}
  
async function countVotes(){
    txList = await fetchTxs.getAllTransactions();
    
    for(let i=0; i<txList.length;i++){
        const decoded = decoder.decodeData(txList[i].input);
        if(decoded.method == "addVote"){
            votes.push(decoded.inputs[0].toNumber());
        }
    }
    const results = findResults(votes);
    printResults(results);

    return results; //format [{candidate: 1, count: 3}, {candidate: 2, count: 2}, etc...]
}

countVotes();

module.exports.countVotes = countVotes;