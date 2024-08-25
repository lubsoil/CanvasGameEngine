/*
    Game Objects
*/

class DragabbleObject extends GameObject {
    constructor(x, y) {
        super(x, y);

        this.is_dragged = false;
        this.dragged_direction = 0;
    }

    onTick(game) {
        if (game.mouse_current_object != null) {
            if (game.mouse_current_object.instance_id == this.instance_id) {
                this.is_dragged = true;
                if (this.dragged_direction == 0) {
                    if (this.angle < -0.3) {
                        this.dragged_direction = 1;
                    } else {
                        this.angle -= 0.03;
                    }
                } else {
                    if (this.angle > 0.3) {
                        this.dragged_direction = 0;
                    } else {
                        this.angle += 0.03;
                    }
                }
            }
        } else {
            this.is_dragged = false;
            this.angle = 0;
        }

    }
}

class Sheep extends DragabbleObject {
    constructor(x, y) {
        super(x, y);
        this.texture = "SHEEP";
        this.depth = y * 10;
        this.angle = 12;
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -12,
                top: -12,
                right: 12,
                bottom: 12
            }
        }
        this.has_been_draged = false;
    }

    onTick(game) {
        super.onTick(game);
        if (this.is_dragged && !this.has_been_draged) {
            var soundObject = game.getSound("SHEEP");
            soundObject.play(true);

            this.has_been_draged = true;
        } else if (!this.is_dragged && this.has_been_draged) {
            var soundObject = game.getSound("SHEEP");
            soundObject.stop();

            this.has_been_draged = false;
        }
        this.depth = this.y * 10;
    }
}

class Barrel extends DragabbleObject {
    constructor(x, y) {
        super(x, y);
        this.texture = "BARREL";
        this.depth = y * 10 + 1;
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -12,
                top: -12,
                right: 12,
                bottom: 12
            }
        }
    }

    onTick(game) {
        super.onTick(game);
        this.depth = this.y * 10 + 2;
    }
}

class Tree extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.texture = "TREE";
        this.depth = y * 10 + 1;
        this.collision = {
            type: "RECTANGLE",
            size: {
                left: -12,
                top: -12,
                right: 12,
                bottom: 12
            }
        }
        this.texture_frame = Math.floor(Math.random()*5)
    }

    onTick() {
        this.depth = this.y * 10 + 1;
    }
}

class EscapingSheepsGame extends Game {
    constructor(canvas) {
        super(canvas);
    }

    onGameInit() {
        this.room.width = 800;
        this.room.height = 600;

        this.room.background.texture = "BACKGROUND";
        this.room.background.repeat = BACKGROUND_REPEAT.REPEAT;

        this.left_mouse_presed = false;
        this.mouse_current_object = null;

        this.addTexture("MISSING_TEXTURE", new GameTexture("textures/missing.png", 0, 0));
        this.addTexture("BACKGROUND", new GameTexture("textures/background.png", 0, 0));
        this.addTexture("SHEEP", new GameTexture("textures/sheep.png", 16, 16));
        this.addTexture("BARREL", new GameTexture("textures/barrel.png", 16, 16));
        this.addTexture("TREE", new GameTexture("textures/tree.png", 24, 96,48,96));

        this.addSound("SHEEP", new GameSound("sounds/sheep.mp3"));

        for (var i = 0; i < 30; i++) {
            var item_random = Math.floor(Math.random() * 2);
            if (item_random == 0) {
                this.createInstance(new Tree(Math.floor(Math.random() * 800), Math.floor(Math.random() * 600)));
            } else {
                this.createInstance(new Barrel(Math.floor(Math.random() * 800), Math.floor(Math.random() * 600)));
            }
        }
        for (var i = 0; i < 6; i++) {
            var sheep_x = Math.floor(Math.random() * 800);
            var sheep_y = Math.floor(Math.random() * 600);
            var barrel_random = Math.floor(Math.random() * 2);
            if (barrel_random == 0) {
                this.createInstance(new Barrel(sheep_x, sheep_y));
            }
            this.createInstance(new Sheep(sheep_x, sheep_y));
        }
    }

    onGameTick() {
        if (!this.left_mouse_pressed) {
            if (this.isMousePressed("left")) {
                this.left_mouse_pressed = true;
                var movable_object = this.collision_point(this.mousePos.x, this.mousePos.y, DragabbleObject);

                if (movable_object != null) {
                    this.mouse_current_object = movable_object;
                }

            }
        } else {
            if (!this.isMousePressed("left")) {
                this.left_mouse_pressed = false;
                this.mouse_current_object = null;
            }
            if (this.mouse_current_object != null) {
                this.mouse_current_object.x = this.mousePos.x;
                this.mouse_current_object.y = this.mousePos.y;
            }
        }
    }

    onGameDraw(ctx) {
        ctx.font = 'bold 16px "Segue UI"';
        ctx.fillText("Zlap uciekajace owce", 10, 20);
        ctx.stroke();
    }
}