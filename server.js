const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; // Set port (default 3000)

// Configure body parser middleware
app.use(bodyParser.json());

// API endpoint to receive vote data
app.post('/api/vote', (req, res) => {
  const { name, vote } = req.body;

  // Implement your vote processing logic here
  // This could involve updating a database, calling your election simulation script (explained later), etc.
  console.log(`Received vote: Name - ${name}, Vote - ${vote}`);

  // Send a response message
  res.json({ message: "Vote recorded successfully!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
