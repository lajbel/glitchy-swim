// Ka-Boom !!!!!!!!!!!!

kaboom({
    width: 700,
    height: 200,
    font: "unscii"
});

// Load Assets 

loadFont("unscii", "./fonts/unscii.png", 8, 8)

loadSound("score", "./sounds/score.wav");
loadSound("jump", "./sounds/jump.wav");
loadSound("catshouse", "./sounds/catshouse.wav");

loadSprite("sea", "./sprites/sea.png");
loadSprite("seaweed1", "./sprites/seaweed1.png");
loadSprite("seaweed2", "./sprites/seaweed2.png");
loadSprite("seaweed3", "./sprites/seaweed3.png");
loadSprite("seaweed4", "./sprites/seaweed4.png")
loadSprite("boost", "./sprites/boost.png");

loadSprite("fish", "./sprites/fish.png", {
    sliceY: 2,
    sliceX: 1,
    anims: {
        main: {
            from: 0,
            to: 1,
            loop: true,
            speed: 6
        }
    }
});

loadSprite("doublefish", "./sprites/doublefish.png", {
    sliceY: 2,
    sliceX: 1,
    anims: {
        main: {
            from: 0,
            to: 1,
            loop: true,
            speed: 6
        }
    }
});

loadSprite("background", "./sprites/background.png", {
    sliceY: 2,
    sliceX: 1,
    anims: {
        main: {
            from: 0,
            to: 1,
            loop: true,
            speed: 1.7
        }
    }
});

// Game - Global Variables

let highScore = 0;

scene("game", (started) => {
    let boost = false;
    let bgSpeed = 160;
    let swSpeed = 210;
    let level = 1;
    let last = 0;
    let jumpCount = 0;
    let dead = false;

    gravity(700);

    const music = play("catshouse", { loop: true, speed: 0.8 });

    const initText = add([
        text("", { size: 30 }),
        origin("center"),
        pos(center()),
        z(5000)
    ]);

    add([
        sprite("background", { anim: "main" }),
        scale(5),
        pos(0, 0),
        "bg"
    ]);

    add([
        sprite("background", { anim: "main" }),
        scale(5),
        pos(width() / 2, 0),
        "bg"
    ]);

    add([
        sprite("background", { sliceY: true, anim: "main" }),
        scale(5),
        pos(0, height() / 2),
        "bg"
    ]);

    add([
        sprite("background", { sliceY: true, anim: "main" }),
        scale(5),
        pos(width() / 2, height() / 2),
        "bg"
    ]);

    add([
        sprite("background", { anim: "main" }),
        scale(5),
        pos(width(), 0),
        "bg"
    ]);

    add([
        sprite("background", { anim: "main" }),
        scale(5),
        pos((width() * 2) / 2, 0),
        "bg"
    ]);

    add([
        sprite("background", { sliceY: true, anim: "main" }),
        scale(5),
        pos(width(), height() / 2),
        "bg"
    ]);

    add([
        sprite("background", { sliceY: true, anim: "main" }),
        scale(5),
        pos((width() * 2) / 2, height() / 2),
        "bg"
    ]);

    const sea = add([
        sprite("sea"),
        scale(10),
        pos(0, 0),
        opacity(0.3),
        z(50)
    ]);

    add([
        rect(width(), 1),
        pos(0, 190),
        area(),
        solid(),
        opacity(0)
    ]);

    const fish = add([
        sprite("fish", { anim: "main" }),
        scale(2.5),
        origin("bot"),
        pos(55, 176),
        area({ width: 8, height: 4, offset: vec2(0, -6) }),
        body({ maxVel: 210 }),
    ]);

    const score = add([
        text("S:0", { size: 18 }),
        pos(530, 10),
        z(1000),
        {
            value: 0
        }
    ]);

    const highscore = add([
        text("H:" + highScore, { size: 18 }),
        pos(530, 32),
        z(1000),
    ]);

    if (!started) {
        initText.text = "SPACE FOR START";

        debug.paused = true;
        music.stop();
    } else {
        debug.paused = false;
    }

    // Events & Functions

    function spawnSeaweed() {
        add([
            sprite(choose(["seaweed1", "seaweed2", "seaweed3", "seaweed4"]), { flipX: choose([true, false]) }),
            scale(2.5),
            pos(width() + 5, height()),
            origin("botleft"),
            area(),
            "sw"
        ]);

        wait(rand(0.75, 1.4), spawnSeaweed);
    };

    function spawnBoost() {
        add([
            sprite("boost"),
            scale(2),
            pos(width() + 5, rand(90, 130)),
            origin("center"),
            area(),
            z(500000),
            color(255, 255, 255),
            "boost"
        ]);

        wait(rand(20, 70), spawnBoost);
    };

    fish.action(() => {
        if (fish.grounded()) jumpCount = 0;
    });

    sea.action(() => {
        if (boost) {
            const t = time() * 10;
            sea.color.r = wave(127, 255, t);
            sea.color.g = wave(127, 255, t + 1);
            sea.color.b = wave(127, 255, t + 2);
            sea.opacity = 0.4;
        } else {
            sea.color = rgb(146, 255, 253);
            sea.opacity = 0.3;
        }
    });

    action("bg", b => {
        b.move(-bgSpeed * (boost ? 1.5 : 1), 0);

        if (b.pos.x <= -width() / 2) b.pos.x += width() * 1.5;
    });

    action("sw", (s) => {
        s.move(-swSpeed * (boost ? 1.5 : 1), 0);

        if (s.pos.x <= -width()) destroy(s);
    });

    action("boost", (s) => {
        s.move(-swSpeed, 0);

        if (s.pos.x <= -width()) destroy(s);

        const t = time() * 10;

        s.color.r = wave(127, 255, t);
        s.color.g = wave(127, 255, t + 1);
        s.color.b = wave(127, 255, t + 2);
    });

    action(() => {
        if (time() > last + 0.05) {
            score.value += 1 * (boost ? 5 : 1)
            score.text = "S:" + score.value;

            if (score.value > 100 * level) {
                level++;

                play("score");

                bgSpeed += 6;
                swSpeed += 8;
            };

            last = time();
        };
    });

    // Collisions

    fish.collides("sw", () => {
        add([
            text("SPACE FOR RESTART", { size: 30 }),
            origin("center"),
            pos(center()),
            z(5000)
        ]);

        music.stop();

        highScore = score.value;
        highscore.text = "H:" + highScore;

        debug.paused = true;
        dead = true;
    });

    fish.collides("boost", () => {
        boost = true;

        music.speed(1.2);
        fish.use(sprite("doublefish", { anim: "main" }))

        wait(10, () => {
            boost = false
            music.speed(0.8),
                fish.use(sprite("fish", { anim: "main" }))
        });
    });

    // Input

    if (started) spawnSeaweed();
    if (started) wait(20, () => spawnBoost());

    keyPress("space", () => {
        if (debug.paused && !dead) {
            debug.paused = false;
            spawnSeaweed();
            wait(15, () => spawnBoost());
            destroy(initText);
            music.play();
        }

        else if (dead) {
            go("game", true);
        }
        else {
            if (jumpCount == 0) {
                fish.jump(270);
                jumpCount++;
                play("jump");
            }
            else if (jumpCount == 1) {
                fish.jump(240);
                jumpCount++;
                play("jump");
            };
        }
    });

    keyPress("f", () => fullscreen(!fullscreen()));
});

go("game", false);