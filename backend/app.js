const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const app = express();
const bodyParser = require("body-parser");
const geminiModel = require("./gemini_model");
const gameSearch = require("./game_search");
require("dotenv").config();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.static("public"));

// for parsing data to json format
app.use(bodyParser.json());

// defualt route that returns the same data that is received
app.post("/", (req, res) => {
  let userInput = req.body.text;
  res.send(userInput);
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI route
app.post("/api/openai", async (req, res) => {
  try {
    let question = req.body.text;
    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: question }],
      stream: true,
    });

    let result = "";
    for await (const chunk of stream) {
      result += chunk.choices[0]?.delta?.content || "";
    }

    res.send(result);
  } catch (error) {
    console.error("OpenAI error:", error);
    res.send("error");
  }
});

// Testing endpoint to ask Google Gemini to fanout the
// user's query to more targeted search queries.
app.post("/api/gemini", async (req, res) => {
  try {
    let question = req.body.text;
    const response = await gameSearch.fanout({
      userQuery: question,
    });

    res.send(response);
  } catch (error) {
    console.error("Google Gemini error:", error);
    res.send("error");
  }
});

// Google Search API route
app.post("/api/googlesearch", async (req, res) => {
  try {
    let question = req.body.text;
    const response = await gameSearch.search({
      userQuery: question,
    });

    res.send(response);
  } catch (error) {
    console.error("Google Search error:", error);
    res.send("error");
  }
});

// Fanout search route.
app.post("/api/googlefanout", async (req, res) => {
  try {
    const question = req.body.text;
    const response = await gameSearch.fanoutSearches({
      userQuery: question,
    });

    res.send(response);
  } catch (error) {
    console.error("Google Fanout Search error:", error);
    res.send("error");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
