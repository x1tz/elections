var ethers = require('ethers');
let storedVotes = [];

function shuffle(list) {
    const shuffledList = list.slice();
    for (let i = shuffledList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index between 0 and i
      [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]]; // Swap elements
    }
    return shuffledList;
}

async function send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, vote){
    console.log("Entered send_to_network");

    const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
    const contractWithSigner = contract.connect(wallet);

    const tx = await contractWithSigner.addVote(vote);
    // verify the updated value
    await tx.wait();
    // const res = await contract.get();
    // console.log("Obtained value at deployed contract is: "+ res);
    return tx;
}

// 1. Listen for messages from the main script
self.onmessage = (event) => {
    const data = event.data;
    // 2. Process the received data
    console.log('Worker received data:', data);
    // Perform any complex calculations or operations here
    if(storedVotes >= 3){
        storedVotes = shuffle(storedVotes);
        for(let i=0; i<storedVotes.length;i++){
            send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, storedVotes[i]);
            console.log("Worker: Sent vote to blockahin...");
        }

    }
  }
  
