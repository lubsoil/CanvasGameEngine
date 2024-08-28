class Spaceship extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.texture = "SPACESHIP";
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -28,
                top: -28,
                right: 28,
                bottom: 28
            }
        }
        this.flame_index = 0;
        this.flame_animation = 0;
        this.shield_timer = 0;
    }

    onTick(game) {
        if (this.flame_animation < 5) {
            this.flame_animation += 1;
        } else {
            this.flame_animation = 0;
            this.flame_index += 1;
            this.flame_index %= 3;
        }
        if (game.isMousePressed("left")) {
            if (this.y > 50) {
                this.y -= game.gameSpeed * 0.5;
                this.angle = -0.75;
            } else {
                this.angle = 0;
            }
        } else {
            if (this.y < 400) {
                this.y += game.gameSpeed * 0.5;
                this.angle = 0.75;
            } else {
                this.angle = 0;
            }
        }
    }

    drawObject(game, ctx) {
        drawTexture(ctx, game, this.texture, 1 + this.flame_index, this.x, this.y, this.angle);
        drawTexture(ctx, game, this.texture, 0, this.x, this.y, this.angle);
    }
}

class Enemy extends GameObject{
    constructor(x, y) {
        super(x, y);
    }

    onTick(game) {
        this.x -= game.gameSpeed;

        var collision_check = game.collision_rectangle(this.x + this.collision.size.left, this.y + this.collision.size.top, this.x + this.collision.size.right, this.y + this.collision.size.bottom, Spaceship);
        if (collision_check != null) {
            if (game.score > game.highScore) {
                game.highScore = game.score;
            }
            game.score = 0;
            game.enemyTimeout = 10;
            game.player.y = 225;
            game.clearRoom();
        }

        if (this.x < -64) {
            game.removeInstance(this.instance_id);
        }
    }
}

class Asteroid extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.texture = "ASTEROID";
        this.angle = Math.random() * 8;
        this.texture_frame = randomInt(4);
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -16,
                top: -16,
                right: 16,
                bottom: 16
            }
        }
    }

    onTick(game) {
        super.onTick(game);
    }
}

class UFO extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.texture = "UFO";
        this.angle = Math.random() * 8;
        this.texture_frame = randomInt(4);
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -24,
                top: -24,
                right: 24,
                bottom: 24
            }
        }
        this.direction = 0;
        this.speed = 2;
    }

    onTick(game) {
        if (point_distance(game.player.x, game.player.y, this.x, this.y) > 400) {
            this.direction = point_direction(this.x, this.y, game.player.x, game.player.y);
        }
        this.x += lengthdir_x(this.speed, this.direction);
        this.y += lengthdir_y(this.speed, this.direction);

        this.angle += 0.05;

        super.onTick(game)
    }
}

class CubeAlien extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.texture = "CUBEALIEN";
        this.angle = 0;
        this.texture_frame = 0;
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -16,
                top: -16,
                right: 16,
                bottom: 16
            }
        }
        this.direction = 0;
        this.speed = 2;
    }

    onTick(game) {
        if(this.direction == 0){
            if(this.y < 50){
                this.direction = 1;
            }else if(this.angle > 0){
                this.angle -= 0.1;
            }else{
                this.y -= this.speed;
            }
            
        }else{
            if(this.y > 400){
                this.direction = 0;
            }else if(this.angle < 3.1){
                this.angle += 0.1;
            }else{
                this.y += this.speed;
            }
        }

        this.speed = game.gameSpeed/2;

        super.onTick(game);
    }
}

class SpaceCleanerGame extends Game {
    onGameInit() {
        this.room.width = 800;
        this.room.height = 450;
        this.room.background.texture = "SPACE";
        this.room.background.repeat = BACKGROUND_REPEAT.REPEAT;

        this.score = 0;
        this.highScore = 0;

        this.gameSpeed = 5;

        this.segmentTimeout = 100;


        this.addTexture("ASTEROID", new GameTexture("textures/asteroid.png", 16, 16, 32, 32));
        this.addTexture("CUBEALIEN", new GameTexture("textures/cubealien.png", 16, 16, 32, 32));
        this.addTexture("UFO", new GameTexture("textures/ufo.png", 24, 24, 48, 48));
        this.addTexture("SPACESHIP", new GameTexture("textures/spaceship.png", 32, 32, 64, 64));
        this.addTexture("SPACE", new GameTexture("textures/space.png", 0, 0));

        this.player = new Spaceship(128, 225);
        this.createInstance(this.player);
    }

    onGameTick() {
        this.score += this.gameSpeed;

        this.gameSpeed = 6 + (Math.round(this.score / 16) / 500);
        if (this.gameSpeed > 10) {
            this.gameSpeed = 10;
        }

        if (this.enemyTimeout > 0) {
            this.enemyTimeout -= this.gameSpeed;
        } else {
            this.generateRandomSegment();
        }
    }

    generateRandomSegment() {
        var segment_ID = randomInt(5);
        switch (segment_ID) {
            case 0:
                var y_gen = 50 + randomInt(350);
                this.createInstance(new Asteroid(900 + randomInt(25), y_gen));
                this.enemyTimeout = 400;
                break;
            case 1:
                var y_gen = 50 + randomInt(350);
                this.createInstance(new Asteroid(900 + randomInt(25), y_gen));
                this.createInstance(new Asteroid(900 + randomInt(25), y_gen - 50 + randomInt(25)));
                this.enemyTimeout = 400;
                break;
            case 2:
                var y_gen = 50 + randomInt(350);
                this.createInstance(new Asteroid(900 + randomInt(25), y_gen));
                this.createInstance(new Asteroid(900 + randomInt(25), y_gen - 50 + randomInt(25)));
                this.createInstance(new Asteroid(900 + randomInt(25), y_gen + 50 - randomInt(25)));
                this.enemyTimeout = 400;
                break;
            case 3:
                var y_gen = 50 + randomInt(350);
                this.createInstance(new UFO(900 + randomInt(25), y_gen));
                this.enemyTimeout = 500;
                break;
            case 4:
                var y_gen = 50 + randomInt(350);
                this.createInstance(new CubeAlien(900 + randomInt(25), y_gen));
                this.enemyTimeout = 400;
                break;
        }
    }

    clearRoom() {
        this.room.objects.forEach((v, k, m) => {
            if (v instanceof Enemy) {
                this.room.objects.delete(k);
            }
        })
    }

    onGameDraw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillText("Score: " + Math.floor(this.score / 16) + "M\nHighscore: " + Math.floor(this.highScore / 16) + "M", 5, 10);
        ctx.stroke();
    }
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}
