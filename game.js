import kaboom from "https://unpkg.com/kaboom@2000.0.0-beta.23/dist/kaboom.mjs";

// Ka-Boom !!!!!!!!!!!!

const k = kaboom({
  width: 700, 
  height: 200,
  font: "unscii", // The font by default
  canvas: document.getElementById("game"), // Canvas for generate the Kaboom game
});

// Load Assets

k.loadFont("unscii", "./fonts/unscii.png", 8, 8);

k.loadSound("score", "./sounds/score.wav");
k.loadSound("jump", "./sounds/jump.wav");
k.loadSound("catshouse", "./sounds/catshouse.wav");

k.loadSprite("sea", "./sprites/sea.png");
k.loadSprite("seaweed1", "./sprites/seaweed1.png");
k.loadSprite("seaweed2", "./sprites/seaweed2.png");
k.loadSprite("seaweed3", "./sprites/seaweed3.png");
k.loadSprite("seaweed4", "./sprites/seaweed4.png");
k.loadSprite("boost", "./sprites/boost.png");

k.loadSprite("fish", "./sprites/fish.png", {
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

k.loadSprite("doublefish", "./sprites/doublefish.png", {
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

k.loadSprite("background", "./sprites/background.png", {
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

// Game ///////////////////////////////////////////////////////////////

let highScore = k.getData("hs", 0) || 0;

k.scene("game", started => {
  let boost = false;
  let bgSpeed = 130;
  let swSpeed = 210;
  let level = 1;
  let last = 0;
  let jumpCount = 0;
  let dead = false;

  k.gravity(700);

  const music = k.play("catshouse", { loop: true, speed: 0.8 });

  const initText = k.add([
    k.text("", { size: 30 }),
    k.origin("center"),
    k.pos(k.center()),
    k.z(5000)
  ]);

  k.add([
    k.sprite("background", { anim: "main" }),
    k.scale(5),
    k.pos(0, 0),
    "bg"
  ]);

  k.add([
    k.sprite("background", { anim: "main" }),
    k.scale(5),
    k.pos(k.width() / 2, 0),
    "bg"
  ]);

  k.add([
    k.sprite("background", { sliceY: true, anim: "main" }),
    k.scale(5),
    k.pos(0, k.height() / 2),
    "bg"
  ]);

  k.add([
    k.sprite("background", { sliceY: true, anim: "main" }),
    k.scale(5),
    k.pos(k.width() / 2, k.height() / 2),
    "bg"
  ]);

  k.add([
    k.sprite("background", { anim: "main" }),
    k.scale(5),
    k.pos(k.width(), 0),
    "bg"
  ]);

  k.add([
    k.sprite("background", { anim: "main" }),
    k.scale(5),
    k.pos((k.width() * 2) / 2, 0),
    "bg"
  ]);

  k.add([
    k.sprite("background", { sliceY: true, anim: "main" }),
    k.scale(5),
    k.pos(k.width(), k.height() / 2),
    "bg"
  ]);

  k.add([
    k.sprite("background", { sliceY: true, anim: "main" }),
    k.scale(5),
    k.pos((k.width() * 2) / 2, k.height() / 2),
    "bg"
  ]);

  const sea = k.add([
    k.sprite("sea"),
    k.scale(10),
    k.pos(0, 0),
    k.opacity(0.3),
    k.z(50)
  ]);

  k.add([
    k.rect(k.width(), 1),
    k.pos(0, 190),
    k.area(),
    k.solid(),
    k.opacity(0)
  ]);

  const fish = k.add([
    k.sprite("fish", { anim: "main" }),
    k.scale(2.5),
    k.origin("bot"),
    k.pos(55, 176),
    k.area({ width: 8, height: 4, offset: k.vec2(0, -6) }),
    k.body({ maxVel: 210 })
  ]);

  const score = k.add([
    k.text("S:0", { size: 18 }),
    k.pos(530, 10),
    k.z(1000),
    {
      value: 0
    }
  ]);

  const highscore = k.add([
    k.text("H:" + highScore, { size: 18 }),
    k.pos(530, 32),
    k.z(1000)
  ]);

  if (!started) {
    initText.text = "SPACE FOR START";

    k.debug.paused = true;
    music.stop();
  } else {
    k.debug.paused = false;
  }

  // Events & Functions

  function spawnSeaweed() {
    k.add([
      k.sprite(k.choose(["seaweed1", "seaweed2", "seaweed3", "seaweed4"]), {
        flipX: k.choose([true, false])
      }),
      k.scale(2.5),
      k.pos(k.width() + 5, k.height()),
      k.origin("botleft"),
      k.area(),
      "sw"
    ]);

    k.wait(k.rand(0.75, 1.4), spawnSeaweed);
  }

  function spawnBoost() {
    k.add([
      k.sprite("boost"),
      k.scale(2),
      k.pos(k.width() + 5, k.rand(90, 130)),
      k.origin("center"),
      k.area(),
      k.z(500000),
      k.color(255, 255, 255),
      "boost"
    ]);

    k.wait(k.rand(30, 40), spawnBoost);
  }

  fish.action(() => {
    if (fish.grounded()) jumpCount = 0;
  });

  sea.action(() => {
    if (boost) {
      const t = k.time() * 10;
      sea.color.r = k.wave(127, 255, t);
      sea.color.g = k.wave(127, 255, t + 1);
      sea.color.b = k.wave(127, 255, t + 2);
      sea.opacity = 0.4;
    } else {
      sea.color = k.rgb(146, 255, 253);
      sea.opacity = 0.3;
    }
  });

  k.action("bg", b => {
    b.move(-bgSpeed * (boost ? 1.5 : 1), 0);

    if (b.pos.x <= -k.width() / 2) b.pos.x += k.width() * 1.5;
  });

  k.action("sw", s => {
    s.move(-swSpeed * (boost ? 1.5 : 1), 0);

    if (s.pos.x <= -k.width()) k.destroy(s);
  });

  k.action("boost", s => {
    s.move(-swSpeed, 0);

    if (s.pos.x <= -k.width()) k.destroy(s);

    const t = k.time() * 10;

    s.color.r = k.wave(127, 255, t);
    s.color.g = k.wave(127, 255, t + 1);
    s.color.b = k.wave(127, 255, t + 2);
  });

  k.action(() => {
    if (k.time() > last + 0.05) {
      score.value += 1 * (boost ? 5 : 1);
      score.text = "S:" + score.value;

      if (score.value > 100 * level) {
        level++;

        k.play("score");

        bgSpeed += 6;
        swSpeed += 8;
      }

      last = k.time();
    }
  });

  // Collisions

  fish.collides("sw", () => {
    k.add([
      k.text("SPACE FOR RESTART", { size: 30 }),
      k.origin("center"),
      k.pos(k.center()),
      k.z(5000)
    ]);

    music.stop();
    
    if(score.value > highScore) {
      highScore = score.value;
      highscore.text = "H:" + highScore;
      k.setData("hs", score.value);
    }
  
    k.debug.paused = true;
    dead = true;
  });

  fish.collides("boost", () => {
    boost = true;

    music.speed(1.2);
    fish.use(k.sprite("doublefish", { anim: "main" }));

    k.wait(10, () => {
      boost = false;
      music.speed(0.8), fish.use(k.sprite("fish", { anim: "main" }));
    });
  });

  // Input

  if (started) spawnSeaweed();
  if (started) k.wait(20, () => spawnBoost());

  k.keyPress("space", () => {
    if (k.debug.paused && !dead) {
      k.debug.paused = false;
      spawnSeaweed();
      k.wait(15, () => spawnBoost());
      k.destroy(initText);
      music.play();
    } else if (dead) {
      k.go("game", true);
    } else {
      if (jumpCount == 0) {
        fish.jump(270);
        jumpCount++;
        k.play("jump");
      } else if (jumpCount == 1) {
        fish.jump(240);
        jumpCount++;
        k.play("jump");
      }
      else if (jumpCount == 2 && boost) {
        fish.jump(240);
        jumpCount++;
        k.play("jump");
      }; 
    };
  });

  k.keyPress("f", () => k.fullscreen(!k.fullscreen()));
});

k.go("game", false);
