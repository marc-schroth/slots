/** Required modules **/
var express = require('express');
var path = require('path');

/** Globals **/
var app = express();
var players = {};

/** Constants **/
var NEW_PLAYER_CREDITS = 20;

/** Server config **/
app.use('/', express.static(__dirname + '/public')); // Serves static files

app.get('/play/:playerName', function(request,response) { // Game logic
    // Initialize response
    response.writeHead(200, {'Content-Type':'application/json'});
    var responseData = { newPlayer:undefined,
                 spinResult:undefined};
    
    // Extract data from request
    var playerName = request.params.playerName;
    var spin = request.query.spin;
    
    // If player doesn't exist, create and give 20 credits.
    if (players[playerName] === undefined) {
        players[playerName] = {playerName:playerName, credits:NEW_PLAYER_CREDITS};
        responseData.newPlayer = true;
    }
    var player = players[playerName];
    
    // If player is spinning, handle that
    if (spin) {
        // Generate a spin result
        var spinResult = generateSpinResult();
        
        // Add spin result to response data
        responseData.spinResult = spinResult;
        
        // Adjust credit total
        player.credits += spinResult.value - 1; // -1 for cost of spin
    }
    
    // Add credits to response data, delete player if out of credits
    responseData.credits = player.credits;
    if (player.credits <= 0) {
        delete players[playerName];
    }
    
    // Send the response
    response.end(JSON.stringify(responseData));    
});
// Server listens on port given, or 10987 by default.
app.listen(process.argv[2] || 10987);

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