// Attemptive prompt for Gemini to inspire game search terms.
exports.gamesFanout = (userQuery) => 
`The user is looking for a game suggestion. From the user\'s query, please derive a list of search terms that can potentially match games that satisfies the user\'s interest. Each search term ideally contains less than 10 words. Please be creative. For example, if input is "Farm game", the response can be "Farming|Crop|Harvest|Land|Rural". Please return the results as a list of strings, separated by '|'. Return up to 5 results. User\'s input: ${userQuery}. Output: `;
