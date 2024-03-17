// Attemptive prompt for Gemini to inspire game search terms.
exports.gamesFanout = (userQuery) => 
`The user is looking for a game suggestion. From the user's query, please derive a list of search terms that can potentially match games that satisfies the user's interest. Each search term ideally is concrete enough to be used as a search query to get abundant results. Please be creative. For example, if input is "Farm game", the response can be "Farming Game|Crop Growing Game|Farm Harvest Game|Farm Land Management Game". Please return the results as a list of strings, separated by '|'. Return up to 5 results. User\'s input: ${userQuery}. Output: `;
