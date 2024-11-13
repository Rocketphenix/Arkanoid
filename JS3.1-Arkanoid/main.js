"use strict";

let game = {
	canvasDom: null,
	ctx: null,
	gameStart: false,
	gamePause: false,
	gameOver: false,
	life: 0,

	ball: {
		color: "#FF0000",
		radius: 10,
		x: null,
		y: null,
		speed: 2,
		direction: {
			x: 1,
			y: 1,
		},
	},

	paddle: {
		x: null,
		y: null,
		speed: 4,
		color: "green",
		width: 150,
		height: 20,
		deplacement: 0,
	},
};

function createBrick(x, y) {
	return {
		color: "yellow",
		width: 65,
		height: 30,
		x: x,
		y: y,
	};
}
let wall = [];
let distanceBrick = 25;
let hauteurMur = 20;

document.addEventListener("DOMContentLoaded", function () {
	game.canvasDom = document.getElementById("canvas");
	game.ctx = game.canvasDom.getContext("2d");

	for (let i = 0; i < 252; i++) {
		wall.push(createBrick(distanceBrick, hauteurMur));
		distanceBrick += 85;
		if (distanceBrick + 75 >= game.canvasDom.width) {
			distanceBrick = 25;
			hauteurMur += 40;
		}
	}

	document.addEventListener("keydown", initGame);
});

function initGame(e) {
	if ((e.key == " " && game.gameStart == false) || game.gameOver == true) {
		initPositions();
		document.addEventListener("keydown", gameStat);
	}

	document.addEventListener("keydown", movePlateau);
	document.addEventListener("keyup", movePlateau);
	document.removeEventListener("keydown", initGame);
}

function gameStat(e) {
	if (e.key == " " && game.gameStart == false) game.gameStart = true;
	else if (e.key == " " && game.gamePause == false) {
		game.gamePause = true;
	} else if (e.key == " " && game.gamePause == true) {
		game.gamePause = false;
		requestAnimationFrame(playGame);
	}
}

function displayGame() {
	if (!game.gameOver) {
		game.ctx.clearRect(0, 0, game.canvasDom.width, game.canvasDom.height);

		game.ctx.beginPath();
		game.ctx.fillStyle = game.ball.color;
		game.ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
		game.ctx.fill();

		game.ctx.fillStyle = game.paddle.color;
		game.ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);

		wall.forEach(function (brick) {
			game.ctx.fillStyle = brick.color;
			game.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
		});
		if (game.gamePause == false) requestAnimationFrame(playGame);
		else {
			game.ctx.font = "50px arial";
			game.ctx.fillStyle = "black";
			let taille = game.ctx.measureText("Pause ").width / 2;
			game.ctx.fillText("Pause", game.canvasDom.width / 2 - taille, game.canvasDom.height / 2);
		}
	} else {
		game.ctx.font = "50px arial";
		game.ctx.fillStyle = "black";
		let taille = game.ctx.measureText("GameOver ").width / 2;
		game.ctx.fillText("Game Over", game.canvasDom.width / 2 - taille, game.canvasDom.height / 2);
		document.addEventListener("keydown", restartGame);
	}
}

function initPositions() {
	game.paddle.x = game.canvasDom.width / 2 - game.paddle.width / 2;
	game.paddle.y = game.canvasDom.height - 50;

	game.ball.x = game.canvasDom.width / 2;
	game.ball.y = game.canvasDom.height - 100;

	if (game.life <= 0) {
		wall = [];
		distanceBrick = 25;
		hauteurMur = 20;
		for (let i = 0; i < 252; i++) {
			wall.push(createBrick(distanceBrick, hauteurMur));
			distanceBrick += 85;
			if (distanceBrick + 75 >= game.canvasDom.width) {
				distanceBrick = 25;
				hauteurMur += 40;
			}
		}
		game.life = 2;
	} else game.life--;

	switch (Math.ceil(Math.random() * 3)) {
		case 1:
			game.ball.direction.x = -1;
			break;
		case 2:
			game.ball.direction.x = 0;
			break;
		default:
			game.ball.direction.x = 1;
			break;
	}

	displayGame();
}

function playGame() {
	detectCollisions();

	if (game.gameStart) {
		switch (game.ball.direction.x) {
			case -1:
				if (game.ball.x > 0) game.ball.x -= game.ball.speed;
				break;
			case 1:
				if (game.ball.x < game.canvasDom.width - game.ball.radius) game.ball.x += game.ball.speed;
				break;
		}
		switch (game.ball.direction.y) {
			case -1:
				if (game.ball.y > 0) game.ball.y -= game.ball.speed;
				break;
			case 1:
				if (game.ball.y < game.canvasDom.height - game.ball.radius) game.ball.y += game.ball.speed;
				break;
		}
	} else {
		switch (game.paddle.deplacement) {
			case -1:
				if (game.paddle.x > 0) game.ball.x -= game.paddle.speed;
				break;
			case 1:
				if (game.paddle.x < game.canvasDom.width - game.paddle.width) game.ball.x += game.paddle.speed;
				break;
		}
	}

	switch (game.paddle.deplacement) {
		case -1:
			if (game.paddle.x > 0) game.paddle.x -= game.paddle.speed;
			break;
		case 1:
			if (game.paddle.x < game.canvasDom.width - game.paddle.width) game.paddle.x += game.paddle.speed;
			break;
	}

	displayGame();
}

function movePlateau(e) {
	if (e.key === "ArrowLeft" && e.type === "keydown") game.paddle.deplacement = -1;
	if (e.key === "ArrowRight" && e.type === "keydown") game.paddle.deplacement = 1;

	if (e.type === "keyup" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) game.paddle.deplacement = 0;
}

function detectCollisions() {
	// Collisions murs
	if (game.ball.x >= game.canvasDom.width - game.ball.radius) game.ball.direction.x = -1;
	if (game.ball.x <= 0 + game.ball.radius) game.ball.direction.x = 1;
	if (game.ball.y >= game.canvasDom.height - game.ball.radius) game.gameOver = true;
	if (game.ball.y <= 0 + game.ball.radius) game.ball.direction.y = 1;

	// Collisions paddleTop

	if (
		// Gauche
		game.ball.y + game.ball.radius == game.paddle.y &&
		game.ball.x + game.ball.radius >= game.paddle.x - 2 &&
		game.ball.x < game.paddle.x + game.paddle.width / 3
	) {
		game.ball.direction.y = -1;
		game.ball.direction.x = -1;
	} else if (
		// Millieu
		game.ball.y + game.ball.radius == game.paddle.y &&
		game.ball.x >= game.paddle.x + game.paddle.width / 3 &&
		game.ball.x <= game.paddle.x + game.paddle.width / 1.5
	) {
		game.ball.direction.y = -1;
		game.ball.direction.x = 0;
	} else if (
		// Droite
		game.ball.y + game.ball.radius == game.paddle.y &&
		game.ball.x > game.paddle.x + game.paddle.width / 1.5 &&
		game.ball.x - game.ball.radius <= game.paddle.x + game.paddle.width + 2
	) {
		game.ball.direction.y = -1;
		game.ball.direction.x = 1;
	}

	// Collisions paddleSide
	if (
		game.ball.y + game.ball.radius >= game.paddle.y &&
		game.ball.y - game.ball.radius <= game.paddle.y + game.paddle.height &&
		game.ball.x + game.ball.radius == game.paddle.x
	)
		game.ball.direction.x = -1;

	if (
		game.ball.y + game.ball.radius >= game.paddle.y &&
		game.ball.y - game.ball.radius <= game.paddle.y + game.paddle.height &&
		game.ball.x - game.ball.radius == game.paddle.x + game.paddle.width
	)
		game.ball.direction.x = 1;

	// Collisions Bricks
	wall.forEach((brick, i) => {
		// collision dessous
		if (
			game.ball.y - game.ball.radius <= brick.y + brick.height &&
			game.ball.y - game.ball.radius >= brick.y &&
			game.ball.x + game.ball.radius >= brick.x &&
			game.ball.x - game.ball.radius <= brick.x + brick.width
		) {
			wall.splice(i, 1); // Retire la brique de l'array
			game.ball.direction.y = 1;
			return; // Arrête le traitement après la première collision
		}

		// collision droite
		if (
			game.ball.x - game.ball.radius <= brick.x + brick.width &&
			game.ball.x - game.ball.radius >= brick.x &&
			game.ball.y + game.ball.radius >= brick.y &&
			game.ball.y - game.ball.radius <= brick.y + brick.height
		) {
			wall.splice(i, 1);
			game.ball.direction.x = 1;
			return;
		}

		// collision gauche
		if (
			game.ball.x + game.ball.radius >= brick.x &&
			game.ball.x + game.ball.radius <= brick.x + brick.width &&
			game.ball.y + game.ball.radius >= brick.y &&
			game.ball.y - game.ball.radius <= brick.y + brick.height
		) {
			wall.splice(i, 1);
			game.ball.direction.x = -1;
			return;
		}

		// collision dessus
		if (
			game.ball.y + game.ball.radius >= brick.y &&
			game.ball.y + game.ball.radius <= brick.y + brick.height &&
			game.ball.x + game.ball.radius >= brick.x &&
			game.ball.x - game.ball.radius <= brick.x + brick.width
		) {
			wall.splice(i, 1);
			game.ball.direction.y = -1;
			return;
		}
	});
}

function restartGame(e) {
	if (e.key == " ") {
		game.gameStart = true;
		game.gameOver = false;
		game.gamePause = false;

		document.removeEventListener("keydown", restartGame);
		document.addEventListener("keydown", gameStat);
		initPositions();
	}
}
