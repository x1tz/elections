// 1. Create a Web Worker
const worker = new Worker('worker.js');

// 2. Define a function to send data to the worker
function sendDataToProxy(vote) {
  worker.postMessage(vote);
}

// 3. Handle messages received from the worker
worker.onmessage = (event) => {
  // Process the data returned from the worker (optional)
  //console.log('Data processed by worker:', event.data);
}

// 4. (Optional) Implement logic to handle data storage outside the worker
// This could involve storing data in a thread-safe data structure like an Atomic operation
// or a thread-safe queue

module.exports.sendDataToProxy=sendDataToProxy;
