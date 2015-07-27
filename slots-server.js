/** Required modules **/
var http = require('http');
var url = require('url');
var fs = require('fs');

/** Constants **/
var DEFAULT_PORT = 10987;

/** Globals **/
var players = {};

// Server definition
var server = http.createServer(function(request,response) {
    // Passing true as second argument parses the query string as well.
    var requestUrl = url.parse(request.url,true);

    switch(requestUrl.pathname) {
        case '/':
            getApp(response);
            break;
        case '/play':
            playAction(requestUrl,response);
            break;
        default:
            getApp(response);  
    }
});
// Server listens on port number supplied by first command-line arg.
var port = process.argv[2] || DEFAULT_PORT;
server.listen(port);
console.log('slots-server listening on port ' + port);

/** Response functions **/
function getApp(response) {
    // Serve the game page
    response.writeHead(200, {'Content-Type':'text/html'});
    fs.createReadStream('index.html').pipe(response);
}

function playAction(requestUrl,response) {
    response.writeHead(200, {'Content-Type':'application/json'});
    var data = { newPlayer:undefined,
                 spinResult:undefined,
                 credits:undefined };
    
    // Extract data from query
    var playerName = requestUrl.query.playerName;
    var spin = requestUrl.query.spin;
    
    // If player doesn't exist, create and give 20 credits.
    if (players[playerName] === undefined) {
        players[playerName] = {credits:20};
        data.newPlayer = true;
    }
    var player = players[playerName];
    
    // If player is spinning, handle that
    if (spin) {
        // Generate a spin result
        var spinResult = generateSpinResult();
        
        // Add spin result to response data
        data.spinResult = spinResult;
        
        // Adjust credit total
        player.credits += spinResult.value - 1; // -1 for cost of spin
    }
    
    // Add credits to response data, delete player if out of credits
    data.credits = player.credits;
    if (player.credits <= 0) {
        delete players[playerName];
    }
    
    // Send response
    response.end(JSON.stringify(data));
}

/** Helper functions **/
function generateSpinResult() {
    var result = {spin:undefined,value:undefined};
    
    var spin = [];
    // Generate 3 random integers between 1 and 3 inclusive
    for (i=0; i < 3; i++) {
        spin.push(Math.floor(Math.random() * 3) + 1);
    }
    result.spin = spin;
    
    // If all 3 integers are the same, the prize is 4 * the value.
    if (spin[0] == spin[1] && spin[0] == spin[2]) {
        result.value = spin[0] * 4;
    } else {
        result.value = 0;
    }

    return result;
}