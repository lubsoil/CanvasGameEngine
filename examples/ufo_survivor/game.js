

class Player extends GameObject{
    constructor(x, y) {
        super(x, y);
        this.texture = "UFO";
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
        this.speed = 0;
        this.texture_speed = 5;

        this.bullet_cooldown = 0;

        this.level = 1;
        this.expierience = 0;

        this.stats = {
            speed: 3,
            damage: 2,
            attack_cooldown: 60
        }

        this.depth = 10;
    }

    onInit(game){
        
    }

    onTick(game) {
        super.onTick(game);
        if(game.joystick.visible){
            this.direction = game.joystick.direction;
            this.speed = this.stats.speed * game.joystick.distance;
        }else{
            if(this.speed > 0){
                this.speed -= 0.01;
            }else{
                this.speed = 0;
            }
        }

        this.x += lengthdir_x(this.speed,this.direction);
        if(this.x < 28){
            this.x = 28;
        }else if(this.x > 3972){
            this.x = 3972;	
        }

        this.y += lengthdir_y(this.speed,this.direction);
        if(this.y < 28){
            this.y = 28;
        }else if(this.y > 3972){
            this.y = 3972;	
        }

        this.angle += this.speed*0.01;


        var nearestEnemy = game.instanceNearest(Enemy,this.x,this.y);
        if(nearestEnemy != null){
            var distance = point_distance(this.x,this.y,nearestEnemy.x,nearestEnemy.y);
            if(distance < 256 && this.bullet_cooldown == 0){
                var direction = point_direction(this.x,this.y,nearestEnemy.x,nearestEnemy.y);
                var bullet = new Projectile(this.x,this.y);
                bullet.speed = this.stats.speed + 1;
                bullet.damage = this.stats.damage;
                bullet.direction = direction;
                game.createInstance(bullet);
                this.bullet_cooldown = this.stats.attack_cooldown;
                
            }
        }

        if(this.bullet_cooldown > 0){
            this.bullet_cooldown--;
        }

        if(this.expierience >= 10*this.level){
            this.level += 1;
            var random_reward = Math.round(Math.random() * 3);
            if(random_reward == 0){
                if(this.stats.attack_cooldown >= 30){
                    this.stats.attack_cooldown -= 5;
                }
            }else if(random_reward == 1){
                this.stats.speed += 1;
            }else if(random_reward == 2){
                this.stats.damage += 1;
            }
            this.expierience = 0;
        }
    }
}

class Enemy extends GameObject{
    constructor(x, y) {
        super(x, y);
        this.health = 1;
    }

    onTick(game){
        super.onTick(game);
        
        if(this.health <= 0){
            var exp = new Expierience(this.x,this.y);
            game.createInstance(exp);
            game.removeInstance(this.instance_id);
        }
    }
}

class SpaceHornet extends Enemy{
    constructor(x,y){
        super(x,y)
        this.texture = "SPACEHORNET";
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
        this.texture_speed = 10;

        this.health = 5;
        this.speed = 2;
    }

    onTick(game){
        super.onTick(game);

        this.direction = point_direction(this.x,this.y,game.player.x,game.player.y);
        
        this.x += lengthdir_x(this.speed,this.direction);
        this.y += lengthdir_y(this.speed,this.direction);

        this.angle = this.direction+90;
    }
}

class Projectile extends GameObject{
    constructor(x,y){
        super(x,y)
        this.texture = "BULLET";
        this.direction = 0;
        this.speed = 6;
        this.damage = 2;

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
        super.onTick(game);

        this.x += lengthdir_x(this.speed,this.direction);
        this.y += lengthdir_y(this.speed,this.direction);

        var is_hitting_enemy = game.collision_rectangle(this.x+this.collision.size.left, this.y+this.collision.size.top,this.x+this.collision.size.right,this.y+this.collision.size.bottom, Enemy);
        if(is_hitting_enemy != null){
            is_hitting_enemy.health -= this.damage;
            game.removeInstance(this.instance_id);
        }

        if (this.x > 4000 || this.x < 0 || this.y > 4000 || this.y < 0) {
            game.removeInstance(this.instance_id);
        }
    }
}

class Pickable extends GameObject{
    constructor(x,y){
        super(x,y)
    }

    onTick(game){
        var is_hitting_player = game.collision_rectangle(this.x+this.collision.size.left, this.y+this.collision.size.top,this.x+this.collision.size.right,this.y+this.collision.size.bottom, Player);
        if(is_hitting_player != null){
            this.onPickUp(game);
            game.removeInstance(this.instance_id);
        }
    }

    onPickUp(game){

    }
}

class Expierience extends Pickable{
    constructor(x,y){
        super(x,y)
        this.texture = "EXPIERIENCE"
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

    onPickUp(game){
        game.player.expierience += 1;
    }
}

class UfoSurvivorGame extends Game {
    onGameInit() {
        this.room.width = 4000;
        this.room.height = 4000;
        this.room.background.texture = "BACKGROUND";
        this.room.background.repeat = BACKGROUND_REPEAT.REPEAT;
        this.camera.width = 960;
        this.camera.height = 540;
        this.camera.x = 1520;
        this.camera.y = 1750;


        this.addTexture("BACKGROUND", new GameTexture("textures/background.png", 0, 0));
        this.addTexture("UFO", new GameTexture("textures/ufo.png", 24, 24, 48, 48));
        this.addTexture("SPACEHORNET", new GameTexture("textures/spacehornet.png", 32, 32, 64, 64));
        this.addTexture("EXPIERIENCE", new GameTexture("textures/expierience.png", 4, 4));
        this.addTexture("BULLET", new GameTexture("textures/bullet.png", 4, 4));
        this.addTexture("JOYSTICK_BORDER", new GameTexture("textures/joystick_border.png", 64, 64));
        this.addTexture("JOYSTICK_STICK", new GameTexture("textures/joystick_stick.png", 24, 24));
        this.addTexture("EXPBAR_EMPTY", new GameTexture("textures/expbar_empty.png", 0, 0));
        this.addTexture("EXPBAR_FULL", new GameTexture("textures/expbar_full.png", 0, 0));

        this.addSound("MUSIC", new GameSound("sounds/music.mp3"));

        

        this.joystick = {
            visible: true,
            position: {
                x: 0,
                y: 0
            },
            stick: {
                x: 0,
                y: 0
            },
            distance: 0,
            direction: 0,
            pressed: false
        }

        this.enemy_cooldown = 0;
        this.enemy_amount = 3;

        this.player = new Player(2000, 2000);
        this.createInstance(this.player);
    }

    onGameTick() {
        //CENTER CAMERA AT PLAYER
        if(this.player != undefined){
            this.camera.x = this.player.x - 480;
            this.camera.y = this.player.y - 270;
        }

        if(this.isMousePressed("left")){
            if(!this.joystick.pressed){
                this.joystick.pressed = true;
                this.joystick.visible = true;

                this.joystick.position.x = this.mousePos.x;
                this.joystick.position.y = this.mousePos.y;

                this.joystick.stick.x = this.mousePos.x;
                this.joystick.stick.y = this.mousePos.y;
            }else{
                var mx = this.mousePos.x;
                var my = this.mousePos.y;
                var p_distance = point_distance(this.joystick.position.x ,this.joystick.position.y,mx,my);
                var p_direction = point_direction(this.joystick.position.x ,this.joystick.position.y,mx,my);

                this.joystick.distance = (p_distance/64);
                this.joystick.direction = p_direction;

                if(p_distance > 64){
                    mx = this.joystick.position.x + lengthdir_x(64,p_direction);
                    my = this.joystick.position.y + lengthdir_y(64,p_direction);
                    this.joystick.distance = 1;
                }

                this.joystick.stick.x = mx;
                this.joystick.stick.y = my;
            }
        }else{
            this.joystick.pressed = false;
            this.joystick.visible = false;
        }
        
        if(this.enemy_cooldown > 0){
            this.enemy_cooldown-=1;
        }else{
            if (this.instanceNumber(Enemy) < 5) {
                var random_direction = Math.random() * 6;
                this.createInstance(new SpaceHornet(this.player.x + lengthdir_x(500, random_direction), this.player.y + lengthdir_y(500, random_direction)));
                this.enemy_cooldown = 120;
            }
        }

        var soundObject = this.getSound("MUSIC");
        soundObject.play(true);
    }

    onGameDraw(ctx) {
        
    }

    onGameInterfaceDraw(ctx){
        if(this.joystick.visible){
            drawTexture(ctx, this, "JOYSTICK_BORDER", 0, this.joystick.position.x, this.joystick.position.y, 0);
            drawTexture(ctx, this, "JOYSTICK_STICK", 0, this.joystick.stick.x, this.joystick.stick.y, 0);
        }
    }
}
