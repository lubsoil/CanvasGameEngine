class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
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
        this.texture_frame = 0;
        this.instance_id = null;
    }

    onTick(game) {

    }

    drawObject(game, ctx) {
        drawTexture(ctx, game, this.texture, this.texture_frame, this.x, this.y, this.angle);
    }
}

class GameTexture {
    constructor(source, off_x, off_y, width = null, height = null) {
        this.image = new Image();
        this.loaded = false;

        this.origin_x = off_x;
        this.origin_y = off_y;

        this.frames_amount = null;
        this.frames_width = width;
        this.frames_height = height;

        this.image.src = source;
        this.image.addEventListener("load", () => {
            this.loaded = true;
            if (this.frames_height == null) {
                this.frames_height = this.image.height;
            }
            if (this.frames_width == null) {
                this.frames_width = this.image.width;
            }
            this.frames_amount = Math.ceil(this.image.width / this.frames_width) * Math.ceil(this.image.height / this.frames_height);
        });
    }
}

class GameSound {
    constructor(source) {
        this.sound = new Audio(source);
        this.duration = null;
        this.loaded = false;
        this.startOnLoading = false;

        this.sound.addEventListener("canplaythrough", () => {
            this.loaded = true;
            this.duration = this.sound.duration;
            if (this.startOnLoading) {
                this.sound.play();
            }
        });
    }

    play(loop = false) {
        if (this.loaded) {
            this.sound.loop = loop;
            this.sound.play();
        } else {
            this.startOnLoading = true;
        }
    }

    pause() {
        if (this.loaded) {
            this.sound.pause();
        }
    }

    stop() {
        this.sound.loop = false;
        this.sound.currentTime = this.duration;
    }
}

class Game {
    constructor(canvas) {
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
        this.sounds = {};
        this.currentObjectID = 0;
        window.addEventListener("keydown", (e) => { this.onKeyStatusChange(e, this) });
        window.addEventListener("keyup", (e) => { this.onKeyStatusChange(e, this) });
        this.canvasElement.addEventListener("mouseup", (e) => { this.onMouseStatusChange(e, this) });
        this.canvasElement.addEventListener("mousedown", (e) => { this.onMouseStatusChange(e, this) });
        window.addEventListener("mousemove", (e) => { this.onMouseMove(e, this) });

        this.onGameInit();

        this.canvasElement.width = this.room.width;
        this.canvasElement.height = this.room.height;

        setInterval(this.tickEvent, 20, this);

        if (this.canvasElement.getContext) {
            window.requestAnimationFrame(() => { this.drawGameCanvas(); });
        }
    }

    onGameInit() { }

    onGameTick() { }

    onGameDraw(ctx) { }

    tickEvent(game) {
        game.onGameTick();

        game.room.objects.forEach((v) => {
            v.onTick(game);
        })
    }

    /*
        TEXTURES
    */

    addTexture(id, texture) {
        this.textures[id] = texture;
    };

    getTexture(id) {
        return this.textures[id];
    };

    isTextureLoaded(id) {
        if (this.textures.length == 0) return false;
        return this.textures[id].loaded;
    };

    /*
        TEXTURES
    */

    addSound(id, sound) {
        this.sounds[id] = sound;
    };

    getSound(id) {
        return this.sounds[id];
    };

    isSoundLoaded(id) {
        if (this.sounds.length == 0) return false;
        return this.sounds[id].loaded;
    };

    /* 
        INSTANCES
    */

    createInstance(object) {
        object.instance_id = this.currentObjectID;
        this.room.objects.set(this.currentObjectID, object);
        this.currentObjectID++
        return (this.currentObjectID - 1);
    }

    removeInstance(instance_id) {
        this.room.objects.delete(instance_id);
    }

    instanceFind(object, number) {
        var objects = this.room.objects.values().toArray();
        var current = 0;
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj instanceof object) {
                if (current == number) {
                    return obj;
                }
                current++;
            }
        }
    }

    instanceNumber(object) {
        var objects = this.room.objects.values().toArray();
        var number = 0;
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj instanceof object) {
                number++;
            }
        }

        return number;
    }

    /*
        INPUT PROCESSING
    */

    onKeyStatusChange(e, game) {
        e = e || event;
        this.keyboardMap[e.keyCode] = e.type == 'keydown';
    }

    isKeyPressed(selkey) {
        var alias = {
            "ctrl": 17,
            "shift": 16,
            "A": 65,
            "W": 87,
            "S": 83,
            "D": 68,
            "space": 32
        };

        return this.keyboardMap[selkey] || this.keyboardMap[alias[selkey]];
    }

    areKeysPresed() {
        var keylist = arguments;

        for (var i = 0; i < keylist.length; i++)
            if (!isKeyPressed(keylist[i]))
                return false;

        return true;
    }

    onMouseStatusChange(e, game) {
        e = e || event;
        game.mouseMap[e.button] = e.type == 'mousedown';

    }

    onMouseMove(e, game) {
        e = e || event;
        const rect = game.canvasElement.getBoundingClientRect();
        game.mousePos.x = e.clientX - rect.left;
        game.mousePos.y = e.clientY - rect.top;
    }

    isMousePressed(selkey) {
        var alias = {
            "left": 0,
            "middle": 1,
            "right": 2,
            "back": 3,
            "forward": 4,
        };

        return this.mouseMap[selkey] || this.mouseMap[alias[selkey]];
    }

    /*
        DRAWING GAME
    */

    drawGameCanvas() {
        let ctx = this.canvasElement.getContext("2d");

        ctx.clearRect(0, 0, this.room.width, this.room.height);

        //DRAWING BACKGROUND
        if (this.room.background.texture != null) {
            if (this.isTextureLoaded(this.room.background.texture)) {
                if (this.room.background.repeat == BACKGROUND_REPEAT.NONE) {
                    ctx.drawImage(getTexture(this.room.background.texture).image, 0, 0);
                } else if (this.room.background.repeat == BACKGROUND_REPEAT.REPEAT_X) {
                    var texture = this.getTexture(this.room.background.texture).image;
                    var image_width = texture.width;
                    var x = 0;

                    while (x < room.width) {
                        ctx.drawImage(texture, x, 0);
                        x += image_width;
                    }
                } else if (this.room.background.repeat == BACKGROUND_REPEAT.REPEAT_Y) {
                    var texture = this.getTexture(this.room.background.texture).image;
                    var image_height = texture.height;
                    var y = 0;

                    while (y < this.room.height) {
                        ctx.drawImage(texture, 0, y);
                        y += image_height;
                    }
                } else if (this.room.background.repeat == BACKGROUND_REPEAT.REPEAT) {
                    var texture = this.getTexture(this.room.background.texture).image;
                    var image_width = texture.width;
                    var image_height = texture.height;
                    var y = 0;
                    var x = 0;

                    while (y < this.room.height) {
                        x = 0;
                        while (x < this.room.width) {
                            ctx.drawImage(texture, x, y);
                            x += image_width;
                        }
                        y += image_height;
                    }
                }
            }
        }

        //DRAWING OBJECTS
        this.room.objects.values().toArray().sort((a, b) => a.depth - b.depth).forEach((v, k, m) => {
            v.drawObject(this, ctx);
        })

        this.onGameDraw(ctx);

        window.requestAnimationFrame(() => { this.drawGameCanvas(); });
    }

    /*
        COLLISION FUNCTIONS
    */

    collision_point(x, y, object) {
        var objects = this.room.objects.values().toArray();
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj instanceof object) {
                if (obj.collision.type == "RECTANGLE") {
                    if (x >= obj.x + obj.collision.size.left && y >= obj.y + obj.collision.size.top && x <= obj.x + obj.collision.size.right && y <= obj.y + obj.collision.size.bottom) {
                        return obj;
                    }
                }
            }
        }

        return null;
    }

    collision_rectangle(x1, y1, x2, y2, object) {
        var objects = this.room.objects.values().toArray();
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj instanceof object) {
                if (obj.collision.type == "RECTANGLE") {
                    var sx = x1 < x2 ? x1 : x2;
                    var sy = y1 < y2 ? y1 : y2;
                    var ex = x1 > x2 ? x1 : x2;
                    var ey = y1 > y2 ? y1 : y2;
    
                    var obj_sx = obj.x + obj.collision.size.left;
                    var obj_sy = obj.y + obj.collision.size.top;
                    var obj_ex = obj.x + obj.collision.size.right;
                    var obj_ey = obj.y + obj.collision.size.bottom;
    
                    var is_x = false;
                    var is_y = false;
    
                    if((sx >= obj_sx && sx <= obj_ex) || (ex >= obj_sx && ex <= obj_ex)){
                        is_x = true;
                    }
    
                    if((sy >= obj_sy && sy <= obj_ey) || (ey >= obj_sy && ey <= obj_ey)){
                        is_y = true;
                    }
    
                    if(is_x && is_y){
                        return obj;
                    }
                }
            }
        }
    
        return null;
    }
}

/*
    ENUMS
*/

BACKGROUND_REPEAT = {
    NONE: "NONE",
    REPEAT_X: "REPEAT_X",
    REPEAT_Y: "REPEAT_Y",
    REPEAT: "REPEAT"
};

/*
    MATH FUNCTIONS
*/

function point_direction(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function point_distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function lengthdir_x(dist, dir) {
    return dist * Math.cos(dir);
}

function lengthdir_y(dist, dir) {
    return dist * Math.sin(dir);
}

function transformTexture(img, off_x, off_y, x, y, width, height, angle) {
    var cv = document.createElement('canvas');
    cv.width = width * 2;
    cv.height = height * 2;
    var ctx = cv.getContext('2d');

    ctx.translate((height / 2) + off_x, (width / 2) + off_y);
    ctx.rotate(angle);
    ctx.drawImage(img, x, y, width, height, -off_x, -off_y, width, height);

    return cv;
}

function drawTexture(ctx, game, texture, frame, x, y, angle) {
    if (texture != null) {
        if (game.isTextureLoaded(texture)) {
            var textureObject = game.getTexture(texture);

            var final_frame = frame % textureObject.frames_amount;

            var img_width = textureObject.image.width;
            var img_height = textureObject.image.height;

            var per_row = img_width / textureObject.frames_width;

            var dest_x = (final_frame % per_row) * textureObject.frames_width;
            var dest_y = Math.floor(final_frame / per_row) * textureObject.frames_height;

            var final_texture = transformTexture(textureObject.image, textureObject.origin_x, textureObject.origin_y, dest_x, dest_y, textureObject.frames_width, textureObject.frames_height, angle);

            var draw_x = x - textureObject.origin_x - (textureObject.frames_width / 2);
            var draw_y = y - textureObject.origin_y - (textureObject.frames_height / 2);

            ctx.drawImage(final_texture, draw_x, draw_y);
        }
    }
}
