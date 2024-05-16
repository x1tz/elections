const Web3 = require('web3');

const { besu } = require("../keys.js");
const host = besu.rpcnode.url;

// Replace with your Quorum node provider URL
const providerUrl = 'http://localhost:8545'; //host


// Create a Web3 instance connected to your node
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

let myTransactionsList = []; //Initialize an empty list

async function getAllTransactions() {
    const blockNumber = await web3.eth.getBlockNumber(); //Get most recent block number
    //console.log(blockNumber);

    for(let k = 0; k <= blockNumber; k++){
        const block = await web3.eth.getBlock(k); //Get block object by number
        //console.log(block.transactions);
        const hash = block.hash;
        const numberTx = await web3.eth.getBlockTransactionCount(hash);
        if(numberTx > 0){
            for(let i = 0; i < numberTx; i++){
                const txfound = await web3.eth.getTransactionFromBlock(hash, i);
                //console.log("txfound ->"  + txfound);
                myTransactionsList.push(txfound);
            }
        }
    }
    //console.log(myTransactionsList);
}

//Prints hashes of the transactions found
async function printTx(){
    for(let i=0; i<myTransactionsList.length; i++){
        console.log(myTransactionsList[i].hash);
    }
}

//async makes rest of code to wait for getAllTransactions()
(async () => {
    await getAllTransactions();
    console.log("Lista Transacoes: /n" + myTransactionsList); //Print all transactions retrieved
    printTx();
})();



