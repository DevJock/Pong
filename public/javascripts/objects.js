class Arena {
	constructor(offset, border = false) {
		this.offset = offset;
		this.border = border;
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
			fill(125);
			line(this.xMin, this.y, this.xMax, this.y);
			line(this.x, this.yMin, this.x, this.yMax);
			noFill();
			rect(this.x, this.y, this.w, this.h);
		}
	}
}


class Paddle {
	constructor(id, arena, speed) {
		this.id = id;
		this.speed = speed;
		this.arena = arena;
	}

	draw() {
		stroke(255);
		strokeWeight(1);
		fill(255);
		rect(this.x, this.y, PADDLE_THICKNESS, PADDLE_LENGTH);
	}

	set(x,y) {
		this.x = x;
		this.y = y;
		this.draw();
	}

	rescale() {
		switch (this.id) {
			case 0: {
				this.x = this.arena.xMin + PADDLE_THICKNESS / 2;
				this.y = this.arena.centerY;
			} break;
			case 1: {
				this.x = arena.xMax - PADDLE_THICKNESS / 2;
				this.y = arena.centerY;

			} break;
		}
		this.computeBoundaries();
	}

	computeBoundaries() {
		this.lMin = this.y - PADDLE_LENGTH / 2;
		this.lMax = this.y + PADDLE_LENGTH / 2;
		this.tMin = this.x - PADDLE_THICKNESS / 2;
		this.tMax = this.x + PADDLE_THICKNESS / 2;
	}

	move(x, y) {
		switch (this.id) {
			case 0:
			case 1: {
				this.y += y * this.speed;
				this.y = constrain(this.y, arena.yMin + PADDLE_LENGTH / 2, arena.yMax - PADDLE_LENGTH / 2);
			}; break;
		}
		this.computeBoundaries();
	}
}



class Ball {
	constructor(id, x, y, dx, dy, speed) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.speed = speed;
		this.rescale();
	}

	rescale(){
		this.size = BALL_SIZE;
		this.radius = BALL_SIZE / 2;
	}


	move() {
		this.x += this.dx * this.speed;
		this.y += this.dy * this.speed;
	}
	
	set(x,y){
		this.x = x;
		this.y = y;
		this.draw();
	}

	draw() {
		strokeWeight(1);
		stroke(255);
		fill(255);
		ellipse(this.x, this.y, this.radius, this.radius);
	}

	physX(arena, paddles = null) {

        if (this.x - this.radius / 2 <= arena.xMin || this.x + this.radius / 2 >= arena.xMax) {
			return;
		}

		paddles.forEach(paddle => {
			switch (paddle.id) {
				case 0: {
					if (this.y - this.radius / 2 > paddle.lMin && this.y + this.radius / 2 < paddle.lMax) {
						if (this.x - this.radius / 2 <= paddle.tMax) {
							this.dx = -this.dx;
						}
					}
				}; break;
				case 1: {
					if (this.y - this.radius / 2 > paddle.lMin && this.y - this.radius / 2 < paddle.lMax) {
						if (this.x + this.radius / 2 >= paddle.tMin) {
							this.dx = -this.dx;
						}
					}
				}; break;
			}
        });
        
		if (this.y - this.radius / 2 <= arena.yMin) {
			this.dy = -this.dy;
		}

		if (this.y + this.radius / 2 >= arena.yMax) {
			this.dy = -this.dy;
		}
	}
}