const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const app = express();
const bodyParser = require("body-parser");
const geminiModel = require('./gemini_model');
const gameSearch = require('./game_search');
require("dotenv").config();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.static("public"));

app.use(bodyParser.json());

app.post("/", (req, res) => {
  // 获取来自前端的数据
  let userInput = req.body.text;

  // 返回响应给前端（这里简单地返回接收到的数据）
  res.send(userInput);
});

const key = process.env.API_KEY;

const openai = new OpenAI({
  apiKey: key,
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

// Google Gemini route
app.post("/api/gemini", async (req, res) => {
  try {
    let question = req.body.text;
    const response = await geminiModel.run({
      prompt: question
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
      userQuery: question
    });

    res.send(response);
  } catch (error) {
    console.error("Google Search error:", error);
    res.send("error");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});