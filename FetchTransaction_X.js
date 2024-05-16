const Web3 = require('web3');

// Replace with your Quorum node provider URL
const providerUrl = 'http://localhost:8545';

// Create a Web3 instance connected to your node
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

// Transaction hash you want to fetch
const transactionHash = '0x1ed7356f368607cfbe3da3c4068bfc87df597d775d32df99085b8ddf5342a913'; // Replace with actual hash

async function getTransaction(hash) {
  try {
    const transaction = await web3.eth.getTransaction(hash);
    console.log(transaction); // This will include input data for the function call
  } catch (error) {
    console.error('Error fetching transaction:', error);
  }
}

getTransaction(transactionHash);
