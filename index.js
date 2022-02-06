const http = require('http');
const app = require('express')();

// Serve the HTML file
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

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

httpServer.listen(8080, () => console.log("Websocket Server Listening on Port: 8080"));

wsServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  connection.on("open", () => console.log("New socket connection opended!"));
  connection.on("close", () => console.log("New socket connection closed!"));

  connection.on("message", (message) => {
    let result = JSON.parse(message.utf8Data);
    let method = result.method;
    console.log("Recieved this message from " + result.clientID + " " + JSON.stringify(result));
    // method = create
    if(method == "create"){
      let clientID = result.clientID;
      let gameID = guid();
      games[gameID] = {
        "id": gameID,
        "cells": 50,
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
      let clientID = result.clientID;
      let gameID = result.gameID;
      let color = getRandomColor();
      const game = games[gameID];
      console.log(games);
      console.log(game);
      game.clients.push({
        "clientID": clientID,
        "color": color
      });
      // Start the game when we got multi players
      if(game.clients.length == 2) updateGameState();
      let payload = {
        "method": "join",
        "game": game
      };
      // Send this update to all the clients
      game.clients.forEach(client => {
        clients[client.clientID].connection.send(JSON.stringify(payload));
      });
    }

    // method == play
    if(method == "play"){
      let gameID = result.gameID;
      let cellID = result.cellID;
      let color = result.color;
      let state = games[gameID].state;
      if(!state)
        state = {};
      state[cellID] = color;
      games[gameID].state = state;
    }
  });
  // New client ID generation
  const clientID = guid();
  clients[clientID] = {
    "connection": connection
  };
  const payload = {
    "method": "connect",
    "clientID": clientID
  };
  connection.send(JSON.stringify(payload));
});

// Functions from stackoverflow to create unique GUIDs
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Changing state of the game when new client joins
function updateGameState(){
  for(let g of Object.keys(games)){
    const game = games[g];
    const payload = {
      "method": "update",
      "game": game
    };
    game.clients.forEach(c => {
      clients[c.clientID].connection.send(JSON.stringify(payload));
    });
    // Update game state every half a second
    setTimeout(updateGameState, 500);
  }
}
