/*
    Game Objects
*/

class Player extends GameObject{
    constructor(x,y){
        super(x,y);
        this.texture = "PLAYER";
        this.speed = 1;
        this.depth = 100;
        this.bulletTimeOut = 0;
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

    onTick(game){
        /*
            TIMINGS
        */
        if(this.bulletTimeOut > 0){
            this.bulletTimeOut--;
        }
        
        /*
            PLAYER CONTROLS
        */
        if(game.isKeyPressed("shift")){
            this.speed = 2;
        }else{
            this.speed = 1;
        }

        if(game.isKeyPressed("W")){
            this.y -= this.speed;
        }
        if(game.isKeyPressed("S")){
            this.y += this.speed;
        }
        if(game.isKeyPressed("A")){
            this.x -= this.speed;
        }
        if(game.isKeyPressed("D")){
            this.x += this.speed;
        }

        if(game.isMousePressed("left") && this.bulletTimeOut == 0){
            var bullet = new Bullet(this.x,this.y);
            bullet.direction = point_direction(this.x,this.y,game.mousePos.x,game.mousePos.y);
            bullet.player = this;
            game.createInstance(bullet);
            this.bulletTimeOut = 10;
        }
    }
}

class Bullet extends GameObject{
    constructor(x,y){
        super(x,y);
        this.texture = "BULLET";
        this.direction = Math.random()*6;
        this.speed = 1;
        this.player = null;
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -4,
                top: -4,
                right: 4,
                bottom: 4
            }
        }
    }

    onTick(game){
        this.x = this.x + lengthdir_x(this.speed,this.direction);
        this.y = this.y + lengthdir_y(this.speed,this.direction);

        if(this.player != null){
            var distance = point_distance(this.player.x,this.player.y,this.x,this.y);
            
            if(distance < 20){
                this.speed = 1;
            }else{
                this.speed = distance/20;
            }
        }

        this.angle += 0.1;

        var is_hitting_enemy = game.collision_point(this.x,this.y,Enemy);
        if(is_hitting_enemy != null){
            game.score++;
            game.removeInstance(is_hitting_enemy.instance_id);
            game.removeInstance(this.instance_id);
        }

        if(this.x > 800  || this.x < 0 || this.y > 600 || this.y < 0){
            game.removeInstance(this.instance_id);
        }
    }
}

class Enemy extends GameObject{
    constructor(x,y){
        super(x,y);
        this.texture = "ENEMY";
        this.direction = Math.random()*6;
        this.speed = 0.5;
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -8,
                top: -8,
                right: 8,
                bottom: 8
            }
        }
    }

    onTick(game){
        this.angle+=0.5;
        var player = game.instanceFind(Player, 0);

        this.direction = point_direction(this.x,this.y,player.x,player.y);

        this.x = this.x + lengthdir_x(this.speed,this.direction);
        this.y = this.y + lengthdir_y(this.speed,this.direction);
    }
}

class ShotterGame extends Game{
    constructor(canvas){
        super(canvas);
    }

    onGameInit(){
        this.score = 0;
        this.enemy_spawn_timer = 15;
    
        this.addTexture("MISSING_TEXTURE",new GameTexture("textures/missing.png",0,0));
        this.addTexture("BACKGROUND", new GameTexture("textures/background.png",0,0));
        this.addTexture("PLAYER", new GameTexture("textures/player.png",16,16));
        this.addTexture("BULLET", new GameTexture("textures/bullet.png",4,4));
        this.addTexture("ENEMY", new GameTexture("textures/enemy.png",8,8));
    
        this.room.background.texture = "BACKGROUND";
        this.room.background.repeat = BACKGROUND_REPEAT.REPEAT;
        
        this.createInstance(new Player(400,300));
    }
    
    onGameTick(){
        //SPAWNING ENEMIES
        if(this.enemy_spawn_timer > 0){
            this.enemy_spawn_timer--;
        }else{
            this.enemy_spawn_timer = 60;
            if(this.instanceNumber(Enemy) < 5){
                var random_direction = Math.random()*6;
                this.createInstance(new Enemy(400 + lengthdir_x(420,random_direction),200 + lengthdir_y(420,random_direction)));
            }
        }  
    }

    onGameDraw(ctx){
        ctx.font = 'bold 16px "Segue UI"';
        ctx.fillText("Score: " + this.score, 10, 20);
        ctx.stroke();
    }
}