/*
    Game Objects
*/

class Player extends GameObject{
    constructor(x,y){
        super(x,y);
        this.origin_x = 16;
        this.origin_y = 16;
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

    onTick(){
        /*
            TIMINGS
        */
        if(this.bulletTimeOut > 0){
            this.bulletTimeOut--;
        }
        
        /*
            PLAYER CONTROLS
        */
        if(isKeyPressed("shift")){
            this.speed = 2;
        }else{
            this.speed = 1;
        }

        if(isKeyPressed("W")){
            this.y -= this.speed;
        }
        if(isKeyPressed("S")){
            this.y += this.speed;
        }
        if(isKeyPressed("A")){
            this.x -= this.speed;
        }
        if(isKeyPressed("D")){
            this.x += this.speed;
        }

        if(isMousePressed("left") && this.bulletTimeOut == 0){
            var bullet = new Bullet(this.x,this.y);
            bullet.direction = point_direction(this.x,this.y,mousePos.x,mousePos.y);
            bullet.player = this;
            createInstance(bullet);
            this.bulletTimeOut = 10;
        }
    }
}

class Bullet extends GameObject{
    constructor(x,y){
        super(x,y);
        this.origin_x = 4;
        this.origin_y = 4;
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

    onTick(){
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

        var is_hitting_zombie = collision_point(this.x,this.y,Enemy);
        if(is_hitting_zombie != null){
            removeInstance(is_hitting_zombie.instance_id);
            removeInstance(this.instance_id);
        }

        if(this.x > 800  || this.x < 0 || this.y > 600 || this.y < 0){
            removeInstance(this.instance_id);
        }
    }
}

class Enemy extends GameObject{
    constructor(x,y){
        super(x,y);
        this.origin_x = 8;
        this.origin_y = 8;
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

    onTick(){
        var player = instanceFind(Player, 0);

        this.direction = point_direction(this.x,this.y,player.x,player.y);

        this.x = this.x + lengthdir_x(this.speed,this.direction);
        this.y = this.y + lengthdir_y(this.speed,this.direction);
    }
}

/*
    FUNCTIONS
*/
function onGameInit(){
    enemy_spawn_timer = 15;

    addTexture("MISSING_TEXTURE","textures/missing.png");
    addTexture("BACKGROUND", "textures/background.png");
    addTexture("PLAYER", "textures/player.png");
    addTexture("BULLET", "textures/bullet.png");
    addTexture("ENEMY", "textures/enemy.png");

    room.background.texture = "BACKGROUND";
    room.background.repeat = "REPEAT";
    
    createInstance(new Player(400,300));
}

function onGameTick(){
    //SPAWNING ENEMIES
    if(enemy_spawn_timer > 0){
        enemy_spawn_timer--;
    }else{
        enemy_spawn_timer = 60;
        if(instanceNumber(Enemy) < 3){
            random_direction = Math.random()*6;
            createInstance(new Enemy(400 + lengthdir_x(420,random_direction),200 + lengthdir_y(420,random_direction)));
        }
    }  
}
