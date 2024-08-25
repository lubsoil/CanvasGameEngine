/*
    Game Objects
*/

class HMI_Item extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.texture = "CHARACTER";
    }
}

class HowManyItemsGame extends Game {
    constructor(canvas) {
        super(canvas);
    }

    onGameInit() {
        this.score = 0;
        this.generated = false;
        this.anwser = 0;
        this.keypress_cooldown = 20;

        this.room.width = 400;
        this.room.height = 400;

        this.addTexture("MISSING_TEXTURE", new GameTexture("textures/missing.png", 0, 0));
        this.addTexture("BACKGROUND", new GameTexture("textures/background.png", 0, 0));
        this.addTexture("CHARACTER", new GameTexture("textures/player.png", 16, 16));
        this.addTexture("BULLET", new GameTexture("textures/bullet.png", 4, 4));
        this.addTexture("ENEMY", new GameTexture("textures/enemy.png", 8, 8));
    }

    //48+

    onGameTick() {
        if (this.keypress_cooldown > 0) {
            this.keypress_cooldown--;
        }
        if (this.generated == false) {
            this.anwser = Math.floor(Math.random() * 9);



            for (var i = 0; i < this.anwser; i++) {
                var item = new HMI_Item(Math.floor(Math.random() * 400), Math.floor(Math.random() * 400))
                var id = this.createInstance(item);
            }

            this.generated = true;
        } else if (this.keypress_cooldown == 0) {
            if (this.isKeyPressed(48) || this.isKeyPressed(49) || this.isKeyPressed(50) || this.isKeyPressed(51) || this.isKeyPressed(52) || this.isKeyPressed(53) || this.isKeyPressed(54) || this.isKeyPressed(55) || this.isKeyPressed(56) || this.isKeyPressed(57) || this.isKeyPressed(58)) {
                for (var i = 0; i < 10; i++) {
                    if (this.isKeyPressed(48 + i)) {
                        if (this.anwser == i) {
                            this.score++;
                        }
                        this.room.objects = new Map();
                        this.generated = false;
                        this.keypress_cooldown = 20;
                    }
                }
            }

        }
    }

    onGameDraw(ctx) {
        ctx.font = 'bold 16px "Segue UI"';
        ctx.fillText("Ile Postaci Widzisz na Ekranie?", 10, 20);
        ctx.fillText("Wynik: " + this.score, 10, 40);
        ctx.stroke();
    }
}