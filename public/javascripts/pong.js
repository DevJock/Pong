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
	rescale();
	textAlign(CENTER, CENTER);
	ellipseMode(CENTER);
	rectMode(CENTER);
	angleMode(DEGREES);
	frameRate(60);
	arena = new Arena(10, true);
	ball = new Ball(arena.centerX, arena.centerY, 50, -2, 0);
	paddles.push(new Paddle(0, arena.xMin, arena.centerY, 5));
}

function rescale() {
	Width = gameCanvas.width;
	Height = gameCanvas.height;
	scale = 0.5;
	paddleThickness = 5 / scale;
	fSize = 100;
	if (arena) {
		arena.rescale();
	}
}


function windowResized() {
	let w = canvasHolder.offsetWidth;
	let h = canvasHolder.offsetHeight;
	resizeCanvas(w, h);
	rescale();
}



function draw() {
	background(51);
	drawFrame();
}



function drawFrame() {
	arena.draw();
	paddles.forEach(paddle => {
		paddle.draw();
	});
	ball.move();
	ball.physX(arena, paddles);
	ball.draw();
}


class Arena {
	constructor(offset, border = false) {
		this.offset = offset;
		this.x = Width / 2;
		this.y = Height / 2;
		this.w = Width - this.offset * 2;
		this.h = Height - this.offset * 2;
		this.border = border;
		this.xMin = this.offset;
		this.xMax = this.offset + this.w;
		this.yMin = this.offset;
		this.yMax = this.offset + this.h;
		this.centerX = (this.xMin + this.xMax) / 2;
		this.centerY = (this.yMin + this.yMax) / 2;
	}

	rescale() {
		this.x = Width / 2;
		this.y = Height / 2;
		this.w = Width - this.offset * 2;
		this.h = Height - this.offset * 2;
		this.xMin = this.offset;
		this.xMax = this.offset + this.w;
		this.yMin = this.offset;
		this.yMax = this.offset + this.h;
		this.centerX = (this.xMin + this.xMax) / 2;
		this.centerY = (this.yMin + this.yMax) / 2;
	}

	draw() {
		if (this.border) {
			stroke(255, 0, 0);
			strokeWeight(1);
		} else {
			stroke(0);
			strokeWeight(1);
		}
		fill(125);
		line(this.xMin, this.y, this.xMax, this.y);
		line(this.x, this.yMin, this.x, this.yMax);
		noFill();
		rect(this.x, this.y, this.w, this.h);
	}
}


class Paddle {
	constructor(id, x, y, speed) {
		this.id = id;
		this.x = x + PADDLE_THICKNESS / 2;
		this.y = y;
		this.lMin = Height - this.y - PADDLE_LENGTH;
		this.lMax = Height - this.y + PADDLE_LENGTH;
		this.speed = speed;
	}

	draw() {
		stroke(255);
		strokeWeight(1);
		rect(this.x, this.y, PADDLE_THICKNESS, PADDLE_LENGTH);
	}

	move(x, y) {
		switch (this.id) {
			case 0: {

			}; break;
			case 1: {

			}; break;
			case 2: {

			}; break;
			case 3: {

			};
		}
	}
}



class Ball {
	constructor(x, y, size, dx, dy) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.size = size;
		this.radius = size / 2;
	}

	move() {
		this.x += this.dx;
		this.y += this.dy;
	}

	draw() {
		strokeWeight(1);
		stroke(255, 0, 0);
		fill(125);
		ellipse(this.x, this.y, this.radius, this.radius);
	}

	physX(arena, paddles = null) {

		paddles.forEach(paddle => {
			switch (paddle.id) {
				case 0: {
				}; break;
				case 1: {

				}; break;
				case 2: {

				}; break;
				case 3: {

				};
			}
		});



		if (this.x - this.radius / 2 <= arena.xMin) {
			this.dx = -this.dx;
		}

		if (this.x + this.radius / 2 >= arena.xMax) {
			this.dx = -this.dx;
		}

		if (this.y - this.radius / 2 <= arena.yMin) {
			this.dy = -this.dy;
		}

		if (this.y + this.radius / 2 >= arena.yMax) {
			this.dy = -this.dy;
		}
	}
}