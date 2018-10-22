/**
 * PONGre Server Based PONG Implementation
 * © 2018 Chiraag Bangera.
 * This file contains all the Server side Networking code and also contains the main server side logic for the game.
*/
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const serverIP = require('ip');

// we are defining the port for our server to listen on
let PORT = process.env.PORT || 8080;

app.use(express.static('public'))
// A fix for the CORS Policy
io.set('origins', '*:*');

console.log("Initialized Server on port: " + PORT);

server.listen(PORT);

// this array stores all socket information pk: id
let sockets = [];
// this array stores all the connected client information pk: id
let clients = [];
// this array stores all the players information pk: id
let players = [];
// this array stores all the game sessions pk:id fk: client.id
let sessions = [];


let socketCount = 0;
let clientCount = 0;
let sessionCount = 0;


//incomming connection from a client
io.on('connection', function (socket) {
    var clientIp = socket.request.connection.remoteAddress;
    // a new Socket connection is opened 
    console.log('Connection request from ' + clientIp + ':' + socket.request.connection.remotePort);

    // Connect request from client
    socket.on('connectToServer', function (obj) {
        // username validation
        if (!validateNAME(obj.name)) {
            sendError("Username is Invalid. Try again. No spaces and special characters Allowed.")
            return;
        }
        let client = { id: clientCount++, ip: clientIp, name: obj.name };
        clients.push(client);
        sockets.push({ id: socketCount++, socket: socket, clientID: client.id });
        // Sending handshake confirmation with necessary details
        socket.emit('connected', { message: "Connected to Game Server", clientid: client.id, ip: serverIP.address(), clientip: client.ip, name: client.name });
        // Sending updates to all cients but connecting client
        updateClients();
        console.log("Client# " + client.id + " Connected Successfully with IP: " + client.ip);
    });

    // when the client specifically requests for updates
    socket.on('updates', function () {
        console.log("Specific Request from Client for Updates");
        socket.emit('update', { message: "Client list update from Game Server", clients: clients, players: players });
    });


    // Client hits play against another opponent
    socket.on('startGame', function (data) {
        let p1;
        let p2;
        let p1Socket;
        let p2Socket;
        // we need to move our two playing clients off from the available list to the playing list ie. clients array to players array
        p1 = clientObjForID(data.client.id, true);
        p2 = clientObjForID(data.opponent.id, true);

        players.push(p1);
        players.push(p2);

        p1Socket = socketObjForClientWithID(p1.id).socket;
        p2Socket = socketObjForClientWithID(p2.id).socket;
        // we create a new session object with the required data 
        let session = { id: sessionCount++, p1: p1, p2: p2, p1score: 0, p2score: 0, p1ID: 0, p2ID: 1, pos: { ball: { x: 0.5, y: 0.5 }, paddles: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }] }, p1Socket: p1Socket, p2Socket: p2Socket };

        // client copy of the server session that we will be sending to both players
        let syncData = { id: session.id, p1:session.p1,p2: session.p2, p1score: session.p1score, p2score: session.p2score, p1ID: session.p1ID, p2ID: session.p2ID, pos: session.pos };

        // every client waiting for a game gets a new updated clients database and also a list of players currently active in a session
        updateClients();
        // we start the session for our two active players
        p1Socket.emit('play', { session: syncData });
        p2Socket.emit('play', { session: syncData });
        // we store our session into our master database
        sessions.push(session);
        console.log("Starting Game Session#: " + session.id + " with " + session.p1.id + " and " + session.p2.id);
    });


    // here is where we sync the game with our two connected players
    socket.on('sync', function (moveData) {
        let session;
        // First we find the game session where our client is playing
        session = sessionObjForID(moveData.id, true);
        if (!session) {
            return;
        }
        session.pos = moveData.pos;
        // we synchronize the grid data from the client
        let syncData = { id: session.id, p1:session.p1,p2: session.p2, p1score: session.p1score, p2score: session.p2score, p1ID: session.p1ID, p2ID: session.p2ID, pos: session.pos };
        session.p1Socket.emit('syncClient', { session: syncData });
        session.p2Socket.emit('syncClient', { session: syncData });
        sessions.push(session);
    });

    // Logic to handle client disconnects
    socket.on('disconnect', function () {
        let removedClient;
        let disconnectedSocket;
        let session;

        // get socket details
        disconnectedSocket = socketObjForSocket(socket, true);

        if (!disconnectedSocket) {
            return;
        }
        // finding out if they quit from an active session
        removedClient = playerObjForID(disconnectedSocket.clientID, true);

        // if a player is removed find his session details
        if (removedClient) {
            console.log("Player with Client# " + removedClient.id + " with IP: " + removedClient.ip + " Got disconnected ");
            session = sessionObjForClientWithID(removedClient.id, true);
        }

        // If session details found we do the appropriate updates to the database
        if (session) {
            // we transfer the opponent to active database and send him updates
            let client = playerObjForID(removedClient.id === session.p1.id ? session.p2.id : session.p1.id, true);
            clients.push(client);
            socketObjForClientWithID(client.id).socket.emit('exited', { p1score: session.p1score, p2score: session.p2score });
            updateClients();
            return;
        };

        // we do 2 things here if a player not in a game quit we just remove him and update the other clients with new databse
        // if an active player had quit then we just need to update the clients cause we did the processing above
        removedClient = clientObjForID(disconnectedSocket.clientID, true);
        console.log("Client# " + removedClient.id + " with IP: " + removedClient.ip + " disconnected from server");
        updateClients();
    });

    socket.on('error', function (e) {
        console.log("Socket Error" + e);
    })


    function sendError(message) {
        console.log("Sending error Message");
        socket.emit('errorOccured', { message: message });
    }
});

function updateClients() {
    clientBroadcast('update', { message: "Client list update from Game Server", clients: clients, players: players });
}

function clientBroadcast(trigger, obj) {
    console.log("Client Broadcasting");
    clients.forEach(client => {
        socketObjForClientWithID(client.id).socket.emit(trigger, obj);
    })
}

function clientObjForID(id, splice = false) {
    let client;
    clients.forEach(obj => {
        if (obj.id === id) {
            if (splice) {
                client = clients.splice(clients.indexOf(obj), 1)[0];
            }
            client = obj;
        }
    });
    return client;
}

function playerObjForID(id, splice = false) {
    let player;
    players.forEach(obj => {
        if (obj.id === id) {
            if (splice) {
                player = players.splice(players.indexOf(obj), 1)[0];
            }
            player = obj;
        }
    });
    return player;
}

function sessionObjForID(id, splice = false) {
    let session;
    sessions.forEach(obj => {
        if (obj.id === id) {
            if (splice) {
                session = sessions.splice(sessions.indexOf(obj), 1)[0];
            }
            session = obj;
        }
    });
    return session;
}

function sessionObjForClientWithID(id, splice = false) {
    let session;
    sessions.forEach(obj => {
        if (obj.p1.id === id || obj.p2.id === id) {
            if (splice) {
                session = sessions.splice(sessions.indexOf(obj), 1)[0];
            }
            session = obj;
        }
    });
    return session;
}


function socketObjForClientWithID(id, splice = false) {
    let socketObj;
    sockets.forEach(obj => {
        if (obj.clientID === id) {
            if (splice) {
                socketObj = sockets.splice(sockets.indexOf(obj), 1)[0];
            }
            socketObj = obj;
        }
    });
    return socketObj;
}

function socketObjForSocket(socket, splice = false) {
    let socketObj;
    sockets.forEach(obj => {
        if (obj.socket === socket) {
            if (splice) {
                socketObj = sockets.splice(sockets.indexOf(obj), 1)[0];
            }
            socketObj = obj;
        }
    });
    return socketObj;
}


function validateNAME(str) {
    if (str == undefined) {
        return false;
    }
    str = str.trim();
    var usernameRegex = /^[\wa-zA-Z]{3,12}$/;
    if (str.match(usernameRegex)) {
        return true;
    }
    return false;
}