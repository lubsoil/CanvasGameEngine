
/*
    Game Objects
*/

class GameObject{
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.origin_x = 0;
        this.origin_y = 0;
        this.texture = "MISSING_TEXTURE";
        this.instance_id = null;
    }

    onTick(){

    }

    onMouseClick(mouse_x,mouse_y){

    }

    drawObject(ctx){
        if(isTextureLoaded(this.texture)){
            ctx.drawImage(getTexture(this.texture), this.x-this.origin_x, this.y - this.origin_y);
        }
    }
}

class Player extends GameObject{
    constructor(x,y){
        super(x,y);
        this.origin_x = 16;
        this.origin_y = 16;
        this.texture = "PLAYER";
        this.speed = 1;
        this.bulletTimeOut = 0;
    }

    onMouseClick(mouse_x,mouse_y){
        if(this.bulletTimeOut == 0){
            var bullet = new Bullet(this.x,this.y);
            bullet.direction = point_direction(this.x,this.y,mouse_x,mouse_y);
            bullet.player = this;
            createInstance(bullet);
            this.bulletTimeOut = 5;
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
        if(isKeyPressed("space") && this.bulletTimeOut == 0){
            var bullet = new Bullet(this.x,this.y);
            bullet.player = this;
            createInstance(bullet);
            this.bulletTimeOut = 5;
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

        if(this.x > 800  || this.x < 0 || this.y > 400 || this.y < 0){
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

function initGame(){
    canvasElement = document.getElementById("gameCanvas");
    canvasElement.width = 800;
    canvasElement.height = 400;
    keyMap = {}
    textures = {};
    roomObjects = new Map();
    currentObjectID = 0;
    window.addEventListener("keydown", onKeyStatusChange);
    window.addEventListener("keyup", onKeyStatusChange);
    canvasElement.addEventListener("click", onMouseClick);

    addTexture("MISSING_TEXTURE","textures/missing.png");
    addTexture("PLAYER", "textures/player.png");
    addTexture("BULLET", "textures/bullet.png");
    addTexture("ENEMY", "textures/enemy.png");
    
    createInstance(new Player(400,200));
    createInstance(new Enemy(100,100))

    setInterval(onGameTick, 20);

    if (canvasElement.getContext) {
        window.requestAnimationFrame(() => { drawGameCanvas(); });
    }
}

function onGameTick(){
    roomObjects.forEach((v,k,m)=>{
        v.onTick();
    })
}

/*
    INSTANCES
*/

function createInstance(object){

    object.instance_id = currentObjectID;
    roomObjects.set(currentObjectID, object);
    currentObjectID++
    return (currentObjectID-1);
}

function removeInstance(instance_id){
    roomObjects.delete(instance_id);
}

function instanceFind(object,number){
    var objects = roomObjects.values().toArray();
    var current = 0;
    for(var i = 0;i< objects.length;i++){
        var obj = objects[i];
        if(obj instanceof object){
            if(current == number){
                return obj;
            }
            current++;
        }
    }
}

/*
    TEXTURE LOADING
*/

function addTexture(id,imgSrc){
    var imageObject = {
        image: new Image(),
        loaded: false
    };
    imageObject.image.src = imgSrc;
    imageObject.image.addEventListener("load", () => { imageObject.loaded = true; }, false);
    textures[id] = imageObject;
};

function getTexture(id) {
    return textures[id].image;
};

function isTextureLoaded(id) {
    if (textures.length == 0) return false;
    return textures[id].loaded;
};



//GAME EVENTS

//INPUT
function onKeyStatusChange(e){
    e = e || event;
    keyMap[e.keyCode] = e.type == 'keydown';
}

function isKeyPressed(selkey){
    var alias = {
        "ctrl":  17,
        "shift": 16,
        "A":     65,
        "W":     87,
        "S":     83,
        "D":     68,
        "space": 32
    };

    return keyMap[selkey] || keyMap[alias[selkey]];
}

function areKeysPresed(){
    var keylist = arguments;

    for(var i = 0; i < keylist.length; i++)
        if(!isKeyPressed(keylist[i]))
            return false;

    return true;
}

function onMouseClick(event){
    const rect = canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    roomObjects.forEach((v,k,m)=>{
        v.onMouseClick(x,y);
    })
}

//OUTPUT
function drawGameCanvas(){
    let ctx = canvasElement.getContext("2d");

    ctx.clearRect(0, 0, 800, 400);

    roomObjects.forEach((v,k,m)=>{
        v.drawObject(ctx);
    })
    
    

    //DRAWING LINE
    /*ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.fillRect(0, 399, 800, 400);
    ctx.stroke();*/

    window.requestAnimationFrame(() => { drawGameCanvas(); });
}

//MATH FUNCTIONS
function point_direction(x1,y1,x2,y2){
    return Math.atan2(y2- y1, x2 - x1); 
}

function point_distance(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2)); 
}

function lengthdir_x(dist,dir){
    return dist * Math.cos(dir);
}

function lengthdir_y(dist,dir){
    return dist * Math.sin(dir);
}