const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

const worker = new Worker("./worker.js");

worker.on("message", (data) => {
  console.log("Message from worker:", data);
});

worker.on("error", (err) => {
  console.error("Worker thread error:", err);
});

console.log("Main thread started.");

for (let i = 0; i < 10; i++) {
  console.log(i);
}

// Send a message to the worker to stop (after the loop)
console.log("sending to worker stop");
worker.postMessage({ stop: true }); // Object with a stop property

