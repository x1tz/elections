const Web3 = require('web3');

// Replace with your Quorum node provider URL
const providerUrl = 'http://localhost:8545';

// Create a Web3 instance connected to your node
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

// Transaction hash you want to fetch
const transactionHash = '0x17eb98f41290d2267f9e88d3fedd31780e8c8d35506b998e5d1935eafb23514c'; // Replace with actual hash

async function getTransaction(hash) {
  try {
    const transaction = await web3.eth.getTransaction(hash);
    console.log(transaction); // This will include input data for the function call
  } catch (error) {
    console.error('Error fetching transaction:', error);
  }
}

getTransaction(transactionHash);
