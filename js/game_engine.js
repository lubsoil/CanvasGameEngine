class GameObject{
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.origin_x = 0;
        this.origin_y = 0;
        this.depth = 0;
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            }
        }
        this.texture = null;
        this.instance_id = null;
    }

    onTick(game){

    }

    drawObject(game, ctx){
        if(this.texture != null){
            if(game.isTextureLoaded(this.texture)){
                ctx.drawImage(game.getTexture(this.texture), this.x-this.origin_x, this.y - this.origin_y);
            }
        }
    }
}

class GameTexture{
    
}

class Game{
    constructor(canvas){
        this.canvasElement = document.getElementById(canvas);
    
        this.keyboardMap = {};   //KLAWIATURA
        this.mouseMap = {};  //MYSZKA
        this.mousePos = {
            x: 0,
            y: 0
        }
        this.room = {
            objects: new Map(),
            width: 800,
            height: 600,
            background: {
                texture: null,
                repeat: "NONE"
            }
        }
        this.textures = {};
        this.currentObjectID = 0;
        window.addEventListener("keydown", (e) => {this.onKeyStatusChange(e,this)});
        window.addEventListener("keyup", (e) => {this.onKeyStatusChange(e,this)});
        this.canvasElement.addEventListener("mouseup", (e) => {this.onMouseStatusChange(e,this)});
        this.canvasElement.addEventListener("mousedown", (e) => {this.onMouseStatusChange(e,this)});
        window.addEventListener("mousemove", (e) => {this.onMouseMove(e,this)});
    
        this.onGameInit();
    
        this.canvasElement.width = this.room.width;
        this.canvasElement.height = this.room.height;
    
        setInterval(this.tickEvent, 20, this);
    
        if (this.canvasElement.getContext) {
            window.requestAnimationFrame(() => { this.drawGameCanvas(); });
        }
    }

    onGameInit(){}

    onGameTick(){}

    tickEvent(game){
        game.onGameTick();

        game.room.objects.forEach((v)=>{
            v.onTick(game);
        })
    }

    /*TEXTURES*/

    addTexture(id,imgSrc){
        var imageObject = {
            image: new Image(),
            loaded: false
        };
        imageObject.image.src = imgSrc;
        imageObject.image.addEventListener("load", () => { imageObject.loaded = true; }, false);
        this.textures[id] = imageObject;
    };

    getTexture(id) {
        return this.textures[id].image;
    };

    isTextureLoaded(id) {
        if (this.textures.length == 0) return false;
        return this.textures[id].loaded;
    };

    /* 
        INSTANCES
    */

    createInstance(object){
        object.instance_id = this.currentObjectID;
        this.room.objects.set(this.currentObjectID, object);
        this.currentObjectID++
        return (this.currentObjectID-1);
    }
    
    removeInstance(instance_id){
        this.room.objects.delete(instance_id);
    }
    
    instanceFind(object,number){
        var objects = this.room.objects.values().toArray();
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
    
    instanceNumber(object){
        var objects = this.room.objects.values().toArray();
        var number = 0;
        for(var i = 0;i< objects.length;i++){
            var obj = objects[i];
            if(obj instanceof object){
                number++;
            }
        }
    
        return number;
    }

    /*
        INPUT PROCESSING
    */

    onKeyStatusChange(e, game){
        e = e || event;
        this.keyboardMap[e.keyCode] = e.type == 'keydown';
    }
    
    isKeyPressed(selkey){
        var alias = {
            "ctrl":  17,
            "shift": 16,
            "A":     65,
            "W":     87,
            "S":     83,
            "D":     68,
            "space": 32
        };
    
        return this.keyboardMap[selkey] || this.keyboardMap[alias[selkey]];
    }
    
    areKeysPresed(){
        var keylist = arguments;
    
        for(var i = 0; i < keylist.length; i++)
            if(!isKeyPressed(keylist[i]))
                return false;
    
        return true;
    }
    
    onMouseStatusChange(e, game){
        e = e || event;
        game.mouseMap[e.button] = e.type == 'mousedown';
        
    }
    
    onMouseMove(e, game){
        e = e || event;
        const rect = game.canvasElement.getBoundingClientRect();
        game.mousePos.x = e.clientX - rect.left;
        game.mousePos.y = e.clientY - rect.top;
    }
    
    isMousePressed(selkey){
        var alias = {
            "left":    0,
            "middle":  1,
            "right":   2,
            "back":    3,
            "forward": 4,
        };
    
        return this.mouseMap[selkey] || this.mouseMap[alias[selkey]];
    }

    /*
        DRAWING GAME
    */

    drawGameCanvas(){
        let ctx = this.canvasElement.getContext("2d");
    
        ctx.clearRect(0, 0, this.room.width, this.room.height);
    
        //DRAWING BACKGROUND
        if(this.room.background.texture != null){
            if(this.isTextureLoaded(this.room.background.texture)){
                if(this.room.background.repeat == "NONE"){
                    ctx.drawImage(getTexture(this.room.background.texture), 0, 0);
                }else if(this.room.background.repeat == "REPEAT_X"){
                    var texture = this.getTexture(this.room.background.texture);
                    var image_width = texture.width;
                    var x = 0;
                    
                    while(x < room.width){
                        ctx.drawImage(texture, x, 0);
                        x+= image_width;
                    }
                }else if(this.room.background.repeat == "REPEAT_Y"){
                    var texture = this.getTexture(this.room.background.texture);
                    var image_height = texture.height;
                    var y = 0;
                    
                    while(y < this.room.height){
                        ctx.drawImage(texture, 0, y);
                        y+= image_height;
                    }
                }else if(this.room.background.repeat == "REPEAT"){
                    var texture = this.getTexture(this.room.background.texture);
                    var image_width = texture.width;
                    var image_height = texture.height;
                    var y = 0;
                    var x = 0;
                    
                    while(y < this.room.height){
                        x = 0;
                        while(x < this.room.width){
                            ctx.drawImage(texture, x, y);
                            x+=image_width;
                        }
                        y+= image_height;
                    }
                }
            }
        }
    
        //DRAWING OBJECTS
        this.room.objects.values().toArray().sort((a,b) => a.depth - b.depth).forEach((v,k,m)=>{
            v.drawObject(this, ctx);
        })
    
        window.requestAnimationFrame(() => { this.drawGameCanvas(); });
    }

    /*
        COLLISION FUNCTIONS
*   */

    collision_point(x,y,object){
        var objects = this.room.objects.values().toArray();
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