class GameObject{
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.origin_x = 0;
        this.origin_y = 0;
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            }
        }
        this.texture = "MISSING_TEXTURE";
        this.instance_id = null;
    }

    onTick(){

    }

    drawObject(ctx){
        if(isTextureLoaded(this.texture)){
            ctx.drawImage(getTexture(this.texture), this.x-this.origin_x, this.y - this.origin_y);
        }
    }
}

/*
    INIT
*/

function initGame(){
    canvasElement = document.getElementById("gameCanvas");
    canvasElement.width = 800;
    canvasElement.height = 400;
    keyboardMap = {};   //KLAWIATURA
    mouseMap = {};  //MYSZKA
    mousePos = {
        x: 0,
        y: 0
    }
    textures = {};
    roomObjects = new Map();
    currentObjectID = 0;
    window.addEventListener("keydown", onKeyStatusChange);
    window.addEventListener("keyup", onKeyStatusChange);
    canvasElement.addEventListener("mouseup", onMouseStatusChange);
    canvasElement.addEventListener("mousedown", onMouseStatusChange);
    window.addEventListener("mousemove", onMouseMove);

    onGameInit();

    setInterval(tickEvent, 20);

    if (canvasElement.getContext) {
        window.requestAnimationFrame(() => { drawGameCanvas(); });
    }
}

function onGameInit(){}

function tickEvent(){
    onGameTick();

    roomObjects.forEach((v,k,m)=>{
        v.onTick();
    })
}

function onGameTick(){}

/*
    TEXTURES
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
    
*/

//INPUT PROCESSING
function onKeyStatusChange(e){
    e = e || event;
    keyboardMap[e.keyCode] = e.type == 'keydown';
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

    return keyboardMap[selkey] || keyboardMap[alias[selkey]];
}

function areKeysPresed(){
    var keylist = arguments;

    for(var i = 0; i < keylist.length; i++)
        if(!isKeyPressed(keylist[i]))
            return false;

    return true;
}

function onMouseStatusChange(e){
    e = e || event;
    mouseMap[e.button] = e.type == 'mousedown';
    
}

function onMouseMove(e){
    e = e || event;
    const rect = canvasElement.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
}

function isMousePressed(selkey){
    var alias = {
        "left":    0,
        "middle":  1,
        "right":   2,
        "back":    3,
        "forward": 4,
    };

    return mouseMap[selkey] || mouseMap[alias[selkey]];
}

/*
    DRAW EVENT
*/

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

/*
    MATH FUNCTIONS
*/

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

/*
    COLLISION FUNCTIONS
*/

//COLLISON FUNCTIONS
function collision_point(x,y,object){
    var objects = roomObjects.values().toArray();
    for(var i = 0;i< objects.length;i++){
        var obj = objects[i];
        if(obj instanceof object){
            if(obj.collision.type == "RECTANGLE"){
                if(x >= obj.x + obj.collision.size.left && y >= obj.y + obj.collision.size.top && x <= obj.x + obj.collision.size.right && y <= obj.y + obj.collision.size.bottom){
                    return obj;
                }
            }
        }
    }

    return null;
}