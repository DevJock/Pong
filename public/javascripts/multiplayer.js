/**
 * Pong Server Based Pong Implementation
 * © 2018 Chiraag Bangera.
 * This file contains all the client side Networking code.
 */

var socket = io.connect({reconnection: false});
var clientData = {};
var opponentData = {};
var serverData = {};
var CLIENTS = [];
var PLAYERS = [];
var connected = false;
var sessionID;
var pos;
var NAME;

let scope = angular.element(document.getElementById("view")).scope();

socket.on('errorOccured', function (server) {
	console.log(server.message);
	if(!scope){
		scope = angular.element(document.getElementById("view")).scope();
	}
	scope.nameError();
	scope.$apply();
});

socket.on('connected', function (server) {
	console.log(server.message);
	connected = true;
	serverData = { ip: server.ip };
	clientData = { id: server.clientid, ip: server.clientip, name: server.name };
	if(!scope){
		scope = angular.element(document.getElementById("view")).scope();
	}
	scope.showDiscovery();
	scope.$apply();
});

socket.on('update', function (server) {
	console.log(server.message);
	CLIENTS = server.clients;
	PLAYERS = server.players;
	for (let i = 0; i < CLIENTS.length; i++) {
		if (CLIENTS[i].id === clientData.id) {
			CLIENTS.splice(i, 1);
		}
	}
	scope.update();
	scope.$apply();
});

socket.on('play', function (server) {
	opponentData = server.session.p2;
	p1Score = server.session.p1score;
	p2Score = server.session.p2score;
	pos = server.session.pos;
	sessionID = server.session.id;
	if (server.session.p1.id === clientData.id) {
		ID = 0;
	}
	else {
		ID = 1;
	}
	scope.game();
	scope.updateUI();
	scope.$apply();
});


socket.on('syncClient', function (server) {
	console.log("Syncing");
	p1Score = server.session.p1score;
	p2Score = server.session.p2score;
	pos = server.session.pos;
	if (!pos) {
		socket.emit('reset', { id: sessionID });
	}
	scope.updateUI();
	scope.$apply();
});


socket.on('end', function (server) {
	console.log("GameOver");
	p1Score = server.session.p1score;
	p2Score = server.session.p2score;
	scope.displayScore();
	scope.$apply();
});



function CONNECT() {
	if (connected) {
		return;
	}
	socket.emit('connectToServer', { id: -1, name: NAME });
}

function PLAY(opponent) {
	opponentData = opponent;
	socket.emit('startGame', { client: clientData, opponent: opponent });
}

function REFRESH(){
	socket.emit('updates');
}



