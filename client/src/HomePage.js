import React, { useState } from "react";
import axios from "axios";

function HomePage() {
  const [userInput, setUserInput] = useState("");
  const [responseText, setResponseText] = useState(""); // State to store OpenAI response

  const handleUserInput = async () => {
    try {
      // const response = await axios.get(
      //   "http://localhost:8000/api/openai/",
      //   { user_input: userInput },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // if (response.status === 200) {
      //   const data = response.data;
      //   // Set OpenAI response to state to display on the page
      //   setResponseText(data.response);
      // } else {
      //   console.error("获取OpenAI响应失败");
      // }
      // const response = await axios.get("http://localhost:3001");

      let response = await axios.post("http://localhost:3001/api/openai", {
        text: userInput,
      });
      setResponseText(response.data);
    } catch (error) {
      console.error("在获取过程中发生错误：", error);
    }
  };

  return (
    <div>
      <h1>HomePage</h1>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={handleUserInput}>Submit</button>

      {/* Display the OpenAI response on the page */}
      {responseText && (
        <div>
          <h2>OpenAI Response:</h2>
          <p>{responseText}</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
