const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.static("public"));

// OpenAI configuration

// Your existing route
// app.get("/", (req, res) => {
//   res.send("Hello Express!");
// });

app.use(bodyParser.json());

app.post("/", (req, res) => {
  // 获取来自前端的数据
  let userInput = req.body.text;

  // 返回响应给前端（这里简单地返回接收到的数据）
  res.send(userInput);
});

// const openai = new OpenAI();
// // OpenAI route
// app.get("/openai", async (req, res) => {
//   try {
//     const stream = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: "Say this is a test" }],
//       stream: true,
//     });

//     let result = "";
//     for await (const chunk of stream) {
//       result += chunk.choices[0]?.delta?.content || "";
//     }

//     res.status(200).json({ result });
//   } catch (error) {
//     console.error("OpenAI error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
