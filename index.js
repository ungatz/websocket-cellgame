const http = require('http');
const app = require('express')();

// Serve the HTML file
app.get("/", (req, res) => res.sendFile(__dirname + "index.html"));

// Start the server
app.listen(3000, () => console.log("Connected on HTTP Port: 3000"));

const webSocketServer = require('websocket').server
const httpServer = http.createServer();
const wsServer = new webSocketServer({
  "httpServer": httpServer
});

// HashMaps for games and clients
const clients = {};
const games = {};

http.listen(8080, () => console.log("Websocket Server Listening on Port: 8080"));

wsServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  connection.on("open", () => console.log("New socket connection opended!"));
  connection.on("close", () => console.log("New socket connection closed!"));
  connection.on("message", (message) => {
    let result = JSON.parse(message.utf8Data);
    let method = result.method;

    // method = create
    if(method == "create"){
      let clientID = result.clientID;
      let gameID = guid();
      games[gameID] = {
        "id": gameID,
        "balls": 50,
        "clients": []
      };
      let payload = {
        "method": "create",
        "game": games[gameID]
      };
      const con = clients[clientID].connection;
      con.send(JSON.stringify(payload));
    }

    // method = join
    if(method == "join"){

    }

    // method == play
    if(method == play){

    }

  });
});

// Functions from stackoverflow to create unique GUIDs
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
