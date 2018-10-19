/**
 * Server Based Pong Implementation
 * © 2018 Chiraag Bangera.
 * Main p5JS file the handles client side Game GUI 
 */

let PADDLE_LENGTH = 100;
let PADDLE_THICKNESS = 20;

var baseSize = {
	w: 720,
	h: 1280
}
let canvasHolder;
let gameCanvas;
let scale;

let fSize;

let Width;
let Height;

let arena;
let ball;
let paddles = [];

function setup() {
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
	paddles.push(new Paddle(0, arena, 5));
	paddles.push(new Paddle(1, arena, 5));
	rescale();
}

function rescale() {
	Width = gameCanvas.width;
	Height = gameCanvas.height;
	fSize = 100;
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
	let w = canvasHolder.offsetWidth;
	let h = canvasHolder.offsetHeight;
	resizeCanvas(w, h);
	rescale();
}

function handleInput() {
	if (keyIsPressed) {
		if (keyCode === UP_ARROW) {
			paddles[ID].move(0, -1);
			paddles[1].move(0, -1);
		}
		else if (keyCode === DOWN_ARROW) {
			paddles[ID].move(0, 1);
			paddles[1].move(0, 1);
		}
	}
}



function draw() {
	background(0);
	drawFrame();
}



function drawFrame() {
	arena.draw();
	handleInput();
	paddles.forEach(paddle => {
		paddle.draw();
	});
	if(ball){
		ball.move();
		ball.physX(arena, paddles);
		ball.draw();
	}
	else{
		ball = new Ball(arena.centerX, arena.centerY, 50, random(-10,10),random(-10,10));
	}
}

function random(min,max){
	return Math.random()*max + min;
}

