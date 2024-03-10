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
// const GOOGLE_SEARCH_API_RESPONSE = require(process.env.GOOGLE_SEARCH_API_RESPONSE);

// [WIP] Not used yet
// const CACHED_STEAM_GAMES = require(process.env.STEAM_GAMES_DATA);
// const geminiModel = require('./gemini_model');

// [WIP] The list of games here seems to be incomplete
// (possibly missing latest game updates?)
// const cachedSteamGames = (() => {
//     map = new Map();
//     CACHED_STEAM_GAMES.applist.apps.forEach(app => {
//         map[parseInt(app.appid,10)] = app.name;
//     })
//     return map;
// })();

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

// WIP
// const terms = await geminiModel.run({
//     prompt: 'The user is looking for a game suggestion. ' +
//             'The library of information only contains a list of names of all the games. ' +
//             'We need to do a linear search in the library by matching name of games ' +
//             'with keyword terms. From the user\'s conversational input, please ' +
//             'derive a list of search terms that can potentially ' +
//             'match games that satisfies the user\'s interest. Each search term ideally ' +
//             'contains less than 3 words. Please be creative. For example, if input is ' +
//             '"FPS", the suggested terms can include "Warfare", "Frontline", ""' User's input: ${
//                 userRequest}. Output: `;
// });

// Parse terms
