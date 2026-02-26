const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello DevOps!');
});

// Function for testing
function sum(a, b) {
  return a + b;
}

module.exports = sum;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
