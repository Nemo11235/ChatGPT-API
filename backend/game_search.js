/**
 * This file outlines a naive search algorithm involving Google Search API
 * and Google Gemini to find a list of relevant games that matches the need
 * of a user.
 *
 * The module accepts a locally cached list of games for DEV, and
 * the model is used for generating keywords to aid the searching.
 */

require("dotenv").config();
const axios = require("axios");
const prompts = require("./prompts");
const geminiModel = require("./gemini_model");

function createGoogleSearchApiUrl({ term, start }) {
  const encodedQuery = encodeURIComponent(term);

  // Caution: Always use HTTPS so that the entire request
  // is encoded to the view of the network.
  return (
    "https://www.googleapis.com/customsearch/v1?" +
    "cx=" +
    process.env.GOOGLE_GAME_SEARCH_ENGINE_ID +
    "&key=" +
    process.env.GOOGLE_SEARCH_API +
    "&q=" +
    encodedQuery +
    "&start=" +
    (start || 0)
  );
}

// Returns a JSON containing the following fields:
// {
//    title: string
//    link: string
//    snippet: string
//    cseThumbnail: {
//      src: string, 
//      width: number,
//      height: number
//    } | undefined
// }
//
function parseAppFromResults(pageResponseJson) {
  return pageResponseJson.items
    .filter((item) => (item.link || '').match("store.steampowered.com/app/"))
    .map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      thumbnail: item.pagemap.cse_thumbnail[0]
    }));
}

// Makes an AXIOs call to get data from Google Search API.
// If the process.env.MODE is set to 1, it will return a stub response instead.
async function searchWithAxios(url) {
  console.log(`Google Search API request sent: ${url}`);
  return (await axios({ method: "get", url })).data;
}

// Return the top AppId results found from Google Search API
// up to 20.
async function googleApiSearch(userRequest) {
  const googleFirstPageResultsUrlPage1 = createGoogleSearchApiUrl({
    term: userRequest,
    start: 0,
  });
  const googleFirstPageResultsUrlPage2 = createGoogleSearchApiUrl({
    term: userRequest,
    start: 11,
  });

  try {
    const page1 = await searchWithAxios(googleFirstPageResultsUrlPage1);
    const page2 = await searchWithAxios(googleFirstPageResultsUrlPage2);

    const page1Results = parseAppFromResults(page1);
    const page2Results = parseAppFromResults(page2);
    return page1Results.concat(page2Results);
  } catch (error) {
    console.log("Google Search API Error: " + error);
    return [];
  }
}

exports.search = async ({ userQuery }) => {
  const results = await googleApiSearch(userQuery);
  return {
    searchTerm: userQuery,
    listOfResults: results,
  };
};

// Given user's search query, query a model to fanout to multiple additional
// search modifiers. Return them as a list of string if success.
exports.fanout = async ({ userQuery }) => {
  const fanoutPrompt = prompts.gamesFanout(userQuery);
  console.log(`Model prompt: ${fanoutPrompt}`);
  const modelResponse = await geminiModel.run({prompt: fanoutPrompt});
  try {
    console.log(`Model response: ${modelResponse}`);
    return {
      searchTerm: userQuery,
      listOfResults: modelResponse.split('|').map((result) => result.trim('\n')),
    };
  } catch (e) {
    console.log(e);
    return {
      searchTerm: userQuery,
      errorMessage: JSON.stringify(e),
    };
  }
}
