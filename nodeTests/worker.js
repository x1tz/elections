const { parentPort } = require("worker_threads");

let running = true;

function stop() {
  console.log("STOP TRIGGERED");
  running = false;
}

while (running) {
  // Simulate some work (replace with your actual work)
  const now = Date.now();
  //while (now + 100 < Date.now()) {} // Simulate some work for 100ms
  console.log("Tesst");
  for (let i = 0; i < 10; i++) {
    console.log("Worker->",i);
  }

  // Check for stop message from main thread
  parentPort.on("message", (msg) => {
    if (msg.stop) {
      stop(); // Call the stop function when receiving a stop message
    }
  });
}

parentPort.postMessage("Worker stopped.");

//module.exports.stop = stop; // Export the stop function (not used in this example)
