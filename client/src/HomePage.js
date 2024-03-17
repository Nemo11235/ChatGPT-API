import React, { useState } from "react";
import axios from "axios";
import "./HomePage.scss";
// import ImageFetcher from "./ImageFetcher.js";

function HomePage() {
  const [userInput, setUserInput] = useState("");
  const [responseText, setResponseText] = useState({
    searchTerm: "popular roguelike games",
    listOfResults: [],
  });
  const [fanoutResult, setFanoutResult] = useState({
    searchTerm: "",
    listOfResults: [],
  });

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

      let response = await axios.post(
        "http://localhost:3001/api/googlesearch",
        {
          text: userInput,
        }
      );
      setResponseText(response.data);
      
      // Test returning fanout response from Gemini.
      // let fanoutResponse = await axios.post(
      //   "http://localhost:3001/api/gemini",
      //   {
      //     text: userInput,
      //   }
      // );
      // setFanoutResult(fanoutResponse.data);
    } catch (error) {
      console.error("在获取过程中发生错误：", error);
    }
  };

  return (
    <div className="homepage-root">
      <div className="search-div">
        <h1>Smart Game Picks</h1>
        <input
          className="input-box"
          type="text"
          value={userInput}
          placeholder="What do you want to play?"
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className="search-btn" onClick={handleUserInput}>
          Search
        </button>
      </div>

      {/* Display the OpenAI response on the page */}
      {responseText.listOfResults.map((result) => (
        <div className="url-div" key={result.id}>
          <img src={result.thumbnail.src} alt="thumbnail"></img>
          <a
            className="url"
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {result.title}
          </a>
        </div>
      ))}

      {/* Display the Gemini fanout response on the page */}
      {fanoutResult.listOfResults ? fanoutResult.listOfResults.map((resultText) => (
        <div className="url-div" key={resultText}>
          {resultText}
        </div>
      )) : ''}
      {fanoutResult.errorMessage ? fanoutResult.errorMessage : ''}
    </div>
  );
}

export default HomePage;
