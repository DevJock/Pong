/**
 * Server Based Pong Implementation
 * © 2018 Chiraag Bangera.
 * Main p5JS file the handles client side Game GUI 
 */

let PADDLE_LENGTH = 100;
let PADDLE_THICKNESS = 20;
let BALL_SIZE = 50;


let BALL_SPEED = 3.5;
let PADDLE_SPEED = 5;

let canvasHolder;
let gameCanvas;
let scale;

let fSize;

let Width;
let Height;

let arena;
let ball;
let paddles = [];

var gameStarted = false;

function STARTGAME() {
	canvasHolder = document.getElementById("canvasHolder");
	let w = canvasHolder.offsetWidth;
	let h = canvasHolder.offsetHeight;
	gameCanvas = createCanvas(w, h);
	gameCanvas.parent(canvasHolder);
	textAlign(CENTER, CENTER);
	ellipseMode(CENTER);
	rectMode(CENTER);
	angleMode(DEGREES);
	frameRate(60);
	arena = new Arena(1);
	paddles.push(new Paddle(paddles.length, arena, PADDLE_SPEED));
	paddles.push(new Paddle(paddles.length, arena, PADDLE_SPEED));
	rescale();
	gameStarted = true;
}

function rescale() {
	Width = gameCanvas.width;
	Height = gameCanvas.height;
	PADDLE_LENGTH = 0.15 * Height;
	if (arena) {
		arena.rescale();
	}
	if (paddles) {
		paddles.forEach(paddle => {
			paddle.rescale();
		});
	}
}


function windowResized() {
	if (!gameStarted) {
		return;
	}
	let w = canvasHolder.offsetWidth;
	let h = canvasHolder.offsetHeight;
	resizeCanvas(w, h);
	rescale();
}

function handleInput() {
	if (keyIsPressed) {
		if (keyCode === UP_ARROW) {
			paddles[ID].move(0, -1);
		}
		else if (keyCode === DOWN_ARROW) {
			paddles[ID].move(0, 1);
		}
	}
}



function draw() {
	background(0);
	if (!gameStarted) {
		return;
	}
	drawScore();
	drawFrame();
	SYNC();
}


function drawScore(){
	textSize(125);
	fill(91);
	stroke(0);
	text(p1Score,Width/6,Height/6);
	text(p1Score,Width/1.25,Height/6);
}


function drawFrame() {
	arena.draw();
	handleInput();
	paddles.forEach(paddle => {
		if (paddle.id === ID) {
			paddle.draw();
		} else {
			let dValues = DENORMALIZER(pos.paddles[ID === 1 ? 0 : 1].x, pos.paddles[ID === 1 ? 0 : 1].y);
			paddle.set(dValues.x, dValues.y);
		}
	});
	let nValues = NORMALIZER(paddles[ID].x, paddles[ID].y);
	pos.paddles[ID].x = nValues.x;
	pos.paddles[ID].y = nValues.y;
	if(!ball){
		ball = new Ball(ID,arena.centerX,arena.centerY, randomX(), randomY(), BALL_SPEED);
	}
	if (ball.id === ID && ID === 0) {
		ball.move();
		ball.physX(arena, paddles);
		ball.draw();
		let nValues = NORMALIZER(ball.x, ball.y);
		pos.ball.x = nValues.x;
		pos.ball.y = nValues.y;
		if (ball.x - ball.radius < arena.xMin){
			p1Score++;
			console.log("Lost Ball.");
			ball = null;
		}
		else if(ball.x + ball.radius > arena.xMax) {
			p2Score++;
			console.log("Lost Ball.");
			ball = null;
		}
	}else{
		let dValues = DENORMALIZER(pos.ball.x, pos.ball.y);
		ball.set(dValues.x,dValues.y);
	}
}

function randomX() {
	return Math.random() > 0.5 ? -1 : 1;
}

function randomY() {
	return Math.random() > 0.5 ? -1 : 1;
}

function NORMALIZER(x, y) {
	return { x: x / Width, y: y / Height };
}

function DENORMALIZER(x, y) {
	return { x: x * Width, y: y * Height };
}