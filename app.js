const http = require('http');

http.createServer((req, res) => {
  res.write("Hello DevOps");
  res.end();
}).listen(3000, "0.0.0.0");

console.log("Server running on port 3000");
