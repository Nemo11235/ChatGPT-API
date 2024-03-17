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
  console.log(`[searchWithAxios] Google Search API request sent: ${url}`);
  return (await axios({ method: "get", url })).data;
}

// Return the top AppId results found from Google Search API, given the offset.
async function googleApiSearch(userRequest, start = 0) {
  const googleFirstPageResultsUrlPage = createGoogleSearchApiUrl({
    term: userRequest,
    start,
  });

  try {
    const page = await searchWithAxios(googleFirstPageResultsUrlPage);
    const results = parseAppFromResults(page);
    return results;
  } catch (error) {
    console.log("[googleApiSearch] Error: " + error);
    return [];
  }
}

// pages - Each google search API call returns up to 10 results.
const search = async ({ userQuery = '', pages = 1 }) => {
  console.log(`[search] begin query = ${userQuery} for ${pages} pages of results.`);
  let start = 0;
  let results = [];
  for (let i = 0; i < pages; i ++) {
    console.log(`[search] querying offset = ${start}.`);
    results = results.concat(await googleApiSearch(userQuery, start));
    start += 10;
  }
  return {
    searchTerm: userQuery,
    listOfResults: results,
  };
};
exports.search = search;

// Given user's search query, query a model to fanout to multiple additional
// search modifiers. Return them as a list of string if success.
const fanout = async ({ userQuery }) => {
  const fanoutPrompt = prompts.gamesFanout(userQuery);
  console.log(`[fanout] Model prompt: ${fanoutPrompt}`);
  const modelResponse = await geminiModel.run({prompt: fanoutPrompt});
  try {
    console.log(`[fanout] Model response: ${modelResponse}`);
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
exports.fanout = fanout;

// Given a user's ambiguous search query, query a model to receive inspired refined queries.
// Use the refined queries to run search to acquire results. Each search will return up to 10
// results. The response will be a list of search terms together with their results list, like:
// { userQuery: string,
//   setsOfResults: [
//    {searchTerm: string, listOfResults: [{Result}, {Result}, ...]}
//    {searchTerm: string, listOfResults: [{Result}, {Result}, ...]}
//    {...}
//   ]
// }
// An errorMessage field will show up if a search api fetch is unsuccessful.
exports.fanoutSearches = async({ userQuery, debug = true }) => {
  console.log('[fanoutSearches] Fanout model call begin');
  const {listOfResults, errorMessage} = await fanout({userQuery});
  if (errorMessage !== undefined) {
    console.log('[fanoutSearches] Fanout model call unsuccessful with error message: ' + errorMessage);
    return {userQuery, errorMessage};
  }
  const response = {userQuery, setsOfResults: []};
  for (const query of listOfResults) {
    console.log(`[fanoutSearches] Issue Search API query = ${query}`);
    response.setsOfResults.push(await search({userQuery: query}));
  }
  console.log(`[fanoutSearches] Finishing with ${response.setsOfResults.length} lists.`);
  return response;
}