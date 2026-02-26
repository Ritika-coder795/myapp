const express = require('express');
const app = express();

// Sample route
app.get('/', (req, res) => {
  res.send("Hello DevOps");
});

// Export app for testing
module.exports = app;

// Start server ONLY if file is run directly
if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}
