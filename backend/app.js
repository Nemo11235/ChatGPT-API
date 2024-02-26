const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());

// Serve static files from the "public" folder
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
