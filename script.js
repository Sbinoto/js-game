const canvas = document.querySelector(".canvas");
const screenSize = 800;
const deathScreen = document.querySelector(".deathScreen");
const startScreen = document.querySelector(".startScreen");
const currentScore = document.querySelector(".current.score");
const recordScore = document.querySelector(".best.score");
const currentKill = document.querySelector(".current.kills");
const recordKill = document.querySelector(".best.kills");
const hearts = Array.from(document.querySelectorAll(".heartIMG"));
const playerAmmo = document.querySelector(".playerAmmo")
const songTitle = document.querySelector(".title");
const songNames = document.querySelector(".names");
const songExtras = document.querySelector(".extras");

function toggleAnimation(onOff) {
    const sprites = document.querySelectorAll(".sprite");
    switch (onOff) {
        case "on":
            for (const i of sprites) {
                i.style.animationPlayState = "running";
            };
            break
        case "off":
            for (const i of sprites) {
                i.style.animationPlayState = "paused";
            };
            break
    };
};

function getPosition(node) {
    const x = parseInt(getComputedStyle(node).getPropertyValue("left").slice(0, -2));
    const y = parseInt(getComputedStyle(node).getPropertyValue("top").slice(0, -2));
    return [x, y]
};

function getSize(node) {
    return parseInt(getComputedStyle(node).getPropertyValue("width").slice(0, -2));
};

function spawn(inOrOut, node) {
    let x;
    let y;
    switch (inOrOut) {
        case "in":
            x = Math.floor(Math.random() * (screenSize - node.size));
            y = Math.floor(Math.random() * (screenSize - node.size));
            break
        case "out":
            x = Math.floor(Math.random() * screenSize);
            y = Math.floor(Math.random() * screenSize);
            const leftRightTopBottom = Math.floor(Math.random() * 4);
            switch (leftRightTopBottom) {
                case 0:
                    x *= -1;
                    y *= -1;
                    break
                case 1:
                    x *= -1;
                    y += screenSize - node.size;
                    break
                case 2:
                    x += screenSize - node.size;
                    y *= -1;
                    break
                case 3:
                    x += screenSize - node.size;
                    y += screenSize - node.size;
                    break
            };
    };
    node.style.left = x + "px";
    node.style.top = y + "px";
};

function isInsideBound(node) {
    const position = getPosition(node);
    if (position[0] < 0 - node.size || position[1] < 0 - node.size || position[0] > screenSize + node.size || position[1] > screenSize + node.size) {
        node.style.visibility = "hidden";
        return false
    } else {
        node.style.visibility = "visible";
        return true
    };
};

function detectCollision(node1, node2) {
    const node1Position = getPosition(node1);
    const node2Position = getPosition(node2);
    const horizontalCollison = (node1Position[0] > node2Position[0] && node1Position[0] < node2Position[0] + node2.size) ||
        (node1Position[0] < node2Position[0] && node1Position[0] + node1.size > node2Position[0]) ||
        (node1Position[0] > node2Position[0] && node1Position[0] + node1.size < node2Position[0] + node2.size) ||
        (node1Position[0] < node2Position[0] && node1Position[0] + node1.size > node2Position[0] + node2.size);
    const verticalCollison = (node1Position[1] > node2Position[1] && node1Position[1] < node2Position[1] + node2.size) ||
        (node1Position[1] < node2Position[1] && node1Position[1] + node1.size > node2Position[1]) ||
        (node1Position[1] > node2Position[1] && node1Position[1] + node1.size < node2Position[1] + node2.size) ||
        (node1Position[1] < node2Position[1] && node1Position[1] + node1.size > node2Position[1] + node2.size);
    return horizontalCollison && verticalCollison
};

class music {

    constructor(title, url, names, extra) {
        this.title = title;
        this.url = url;
        this.names = names;
        this.extras = extra
    };
};

const carmen = new music("Carmen", "./assets/music/carmen.mp3", ["Georges Bizet", "Classical 8 Bit"], "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License");
const canCan = new music("Can-Can", "./assets/music/can-can.mp3", ["Jacques Offenbach", "Bulby"], "Thttps://www.youtube.com/@Bulby");
const mountainKing = new music("In the Hall of the Mountain King", "./assets/music/mountain-king.mp3", ["Edvard Grieg", "Classical 8 Bit"], "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License");
const valkyries = new music("Ride of the Valkyries", "./assets/music/valkyries.mp3", ["Richard Wagner", "Classical 8 Bit"], "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License");
const williamTell = new music("William Tell Overture", "./assets/music/william-tell.mp3", ["Gioachino Rossini", "Classical 8 Bit"], "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License");

const tracks = [carmen, canCan, mountainKing, valkyries, williamTell]

class player {

    constructor() {
        this.node = document.createElement("div");
        this.node.setAttribute("class", "sprite player");
        canvas.appendChild(this.node);
        this.node.size = getSize(this.node);
        this.invincibilityPeriod = 2500;
        this.health = 3;
        this.munition = 7;
    };

    move(wasd) {
        const position = getPosition(this.node);
        if (wasd[0]) {
            this.node.style.top = `${Math.max(0, position[1] - 10)}px`;
        };
        if (wasd[1]) {
            this.node.style.left = `${Math.max(0, position[0] - 10)}px`;
        };
        if (wasd[2]) {
            this.node.style.top = `${Math.min(screenSize - this.node.size, position[1] + 10)}px`;
        };
        if (wasd[3]) {
            this.node.style.left = `${Math.min(screenSize - this.node.size, position[0] + 10)}px`;
        };
    };

    damage() {
        if (this.invincibilityPeriod <= 0) {
            hearts[--this.health].style.visibility = "hidden";
            this.invincibilityPeriod = 2500;
        };
    };
};

class enemy {

    constructor() {
        this.node = document.createElement("div");
        this.node.setAttribute("class", "sprite enemy");
        canvas.appendChild(this.node);
        this.node.size = getSize(this.node);
        this.lastShot = 0;
    };

    move() {
        const position = getPosition(this.node);
        const target = getPosition(play.player.node);
        let x = 0;
        let y = 0;
        if (position[0] > target[0]) {
            x = -4;
        } else {
            x = +4;
        };
        if (position[1] > target[1]) {
            y = -4;
        } else {
            y = +4;
        };
        this.node.style.left = `${position[0] + x}px`;
        this.node.style.top = `${position[1] + y}px`;
    };

    shoot() {
        if (Date.now() - this.lastShot >= 4000) {
            new bullet(this, getPosition(play.player.node));
            this.lastShot = Date.now();
        };
    };

    static enemyHandler() {
        for (let i = 0; i < play.enemies.length; i++) {
            isInsideBound(play.enemies[i].node);
            play.enemies[i].move();
            play.enemies[i].shoot();
            for (let j = 0; j < play.enemies.length; j++) {
                if (j == i) continue;
                if (detectCollision(play.enemies[i].node, play.enemies[j].node)) {
                    const position1 = getPosition(play.enemies[i].node);
                    const position2 = getPosition(play.enemies[j].node);
                    let x = 0;
                    let y = 0;
                    if (position1[0] > position2[0]) {
                        x = 1;
                    } else if (position1[0] < position2[0]) {
                        x = -1;
                    };
                    if (position1[1] > position2[1]) {
                        y = 1;
                    } else if (position1[1] < position2[1]) {
                        y = -1;
                    };
                    play.enemies[i].node.style.left = `${position1[0] + x}px`;
                    play.enemies[i].node.style.top = `${position1[1] + y}px`;
                };
            };
            if (detectCollision(play.enemies[i].node, play.player.node)) {
                play.player.damage();
            };
            if (play.laserbeam && (detectCollision(play.enemies[i].node, play.laserbeam.node1) ||
                detectCollision(play.enemies[i].node, play.laserbeam.node2))) {
                spawn("out", play.enemies[i].node)
            };
        };
    };
};

class ammo {

    constructor() {
        this.node = document.createElement("div");
        this.node.setAttribute("class", "sprite ammo");
        canvas.appendChild(this.node);
        this.node.size = getSize(this.node);
    };

    static ammoHandler() {
        for (let i = 0; i < play.munition.length; i++)
            if (detectCollision(play.player.node, play.munition[i].node)) {
                play.player.munition++;
                spawn("in", play.munition[i].node);
            };
    };
};

class bullet {

    constructor(originObject, endPosition) {
        this.node = document.createElement("div");
        this.node.setAttribute("class", "sprite bullet");
        canvas.appendChild(this.node);
        play.activeBullet.push(this);
        this.node.size = getSize(this.node);
        this.origin = originObject;
        const originPosition = getPosition(originObject.node)
        this.node.style.left = `${originPosition[0] + originObject.node.size / 2}px`;
        this.node.style.top = `${originPosition[1] + originObject.node.size / 2}px`;
        const position = getPosition(this.node);
        this.distance = Math.hypot(endPosition[0] - position[0], endPosition[1] - position[1]);
        this.xRate = (endPosition[0] - position[0]) / this.distance * 14;
        this.yRate = (endPosition[1] - position[1]) / this.distance * 14;

    };

    move() {
        const position = getPosition(this.node);
        this.node.style.left = `${position[0] + this.xRate}px`;
        this.node.style.top = `${position[1] + this.yRate}px`;
    };

    static bulletHandler() {
        let toRemove = new Set();
        for (let i = 0; i < play.activeBullet.length; i++) {
            if (!isInsideBound(play.activeBullet[i].node)) {
                toRemove.add(i);
            };
            play.activeBullet[i].move();
            for (let j = 0; j < play.enemies.length; j++) {
                if (detectCollision(play.activeBullet[i].node, play.enemies[j].node) && play.activeBullet[i].origin === play.player) {
                    play.killCount++;
                    spawn("out", play.enemies[j].node);
                    toRemove.add(i);
                };
            };
            if (detectCollision(play.player.node, play.activeBullet[i].node) && play.activeBullet[i].origin != play.player) {
                play.player.damage();
                toRemove.add(i);
            };
            if (play.laserbeam && (detectCollision(play.laserbeam.node1, play.activeBullet[i].node) || detectCollision(play.laserbeam.node2, play.activeBullet[i].node))) {
                toRemove.add(i);
            };
            for (let j = 0; j < play.activeBullet.length; j++) {
                if (j != i && detectCollision(play.activeBullet[i].node, play.activeBullet[j].node)) {
                    toRemove.add(i);
                    toRemove.add(j);
                };
            };
        };
        if (toRemove.size > 0) {
            toRemove = Array.from(toRemove).sort((a, b) => a - b);
            for (let i = toRemove.length - 1; i >= 0; i--) {
                play.activeBullet[toRemove[i]].node.remove();
                play.activeBullet.splice(toRemove[i], 1);
            };
        };
    };
};

class laser {

    constructor() {
        this.type = Math.floor(Math.random() * 3);
        this.node1 = document.createElement("div");
        this.node2 = document.createElement("div");
        this.node1.setAttribute("class", "laser");
        this.node2.setAttribute("class", "laser");
        canvas.appendChild(this.node1);
        canvas.appendChild(this.node2);
        this.node1.size = getSize(this.node1);
        this.node2.size = this.node1.size;

        switch (this.type) {
            case 2:
                this.node1.style.top = "-800px";
                this.node2.style.top = "800px";
                break
            case 1:
                this.node1.style.left = "-800px";
                this.node2.style.left = "800px";
                break
            case 0:
                this.node1.style.top = "-800px";
                this.node2.style.top = "800px";
                this.node1.style.left = "-800px";
                this.node2.style.left = "800px";
        };
    };

    move() {
        let x = 0;
        let y = 0;
        const position1 = getPosition(this.node1);
        const position2 = getPosition(this.node2);
        switch (this.type) {
            case 2:
                if (position1[1] + this.node1.size + 7 > 350) {
                    return false
                };
                y = 7;
                break
            case 1:
                if (position1[0] + this.node1.size + 7 > 350) {
                    return false
                };
                x = 7;
                break
            case 0:
                if (position1[1] + 7 > 700 - 800) {
                    return false
                };
                x = 7;
                y = 7;
                break
        };
        this.node1.style.left = `${position1[0] + x}px`;
        this.node2.style.left = `${position2[0] - x}px`;
        this.node1.style.top = `${position1[1] + y}px`;
        this.node2.style.top = `${position2[1] - y}px`;
    };

    static laserHandler() {
        if (!play.laserbeam && Date.now() - play.lastLaser >= 10000) {
            play.laserbeam = new laser();
            play.lastLaser = Date.now();
        } else if (play.laserbeam) {
            if (play.laserbeam.move() == false) {
                play.laserbeam.node1.remove();
                play.laserbeam.node2.remove();
                play.laserbeam = false;
            };
        };
        if (play.laserbeam && (detectCollision(play.player.node, play.laserbeam.node1) ||
            detectCollision(play.player.node, play.laserbeam.node2))) {
            play.player.damage();
        };
    };
};

class game {

    constructor() {
        this.running = false;
        this.record = {
            kill: 0,
            score: 0
        };
        this.initialize()
        document.addEventListener("keydown", (event) => this.inputHandler(event));
        document.addEventListener("keyup", (event) => this.inputHandler(event));
        canvas.addEventListener("click", (event) => {
            if (this.player.munition) {
                const canvasInfo = canvas.getBoundingClientRect();
                new bullet(this.player, [event.clientX - canvasInfo.x, event.clientY - canvasInfo.y]);
                this.player.munition--;
            };
        });
        requestAnimationFrame((currentTime) => this.mainLoop(currentTime))
    };

    initialize() {
        while (canvas.lastChild != deathScreen) {
            canvas.lastChild.remove()
        };
        for (const heart of hearts) {
            heart.style.visibility = "visible"
        };
        this.song = false;
        this.killCount = 0;
        this.score = 0;
        this.player = new player();
        this.wasd = [false, false, false, false];
        this.enemies = [];
        this.munition = [];
        for (let i = 4; i >= 0; i--) {
            const enem = new enemy();
            spawn("out", enem.node);
            this.enemies.push(enem);
        };
        for (let i = 5; i >= 0; i--) {
            const amm = new ammo();
            spawn("in", amm.node);
            this.munition.push(amm);
        };
        this.activeBullet = [];
        this.laserbeam = false;
        this.lastLaser = Date.now();
    }

    inputHandler(event) {
        switch (event.type) {
            case "keydown":
                switch (event.key) {
                    case "w":
                        this.wasd[0] = true;
                        break
                    case "a":
                        this.wasd[1] = true;
                        break
                    case "s":
                        this.wasd[2] = true;
                        break
                    case "d":
                        this.wasd[3] = true;
                        break
                    case " ":
                        if (!this.running) {
                            startScreen.style.visibility = "hidden";
                            toggleAnimation("on");
                            if (this.song) {
                                this.song.play();
                            };
                        } else {
                            toggleAnimation("off");
                            startScreen.style.visibility = "visible"
                            if (this.song) {
                                this.song.pause();
                            };
                        };
                        if (this.player.health <= 0) {
                            deathScreen.style.visibility = "hidden";
                            this.initialize();
                        };
                        this.running = !this.running;
                        break
                };
                break
            case "keyup":
                switch (event.key) {
                    case "w":
                        this.wasd[0] = false;
                        break
                    case "a":
                        this.wasd[1] = false;
                        break
                    case "s":
                        this.wasd[2] = false;
                        break
                    case "d":
                        this.wasd[3] = false;
                        break
                };
                break
        };
    };

    UIHandler() {
        currentKill.textContent = this.killCount;
        currentScore.textContent = Math.floor(this.score);
        playerAmmo.textContent = this.player.munition;
    };

    musicHandler() {
        if (!this.song) {
            const song = tracks[Math.floor(Math.random() * 5)];
            songTitle.textContent = song.title;
            songNames.textContent = song.names;
            songExtras.textContent = song.extras;
            this.song = new Audio(song.url);
            this.song.play()
        };
    };

    update() {
        this.score += 1 / 30
        this.player.move(this.wasd)
        if (this.player.invincibilityPeriod) {
            this.player.invincibilityPeriod -= 1000 / 30;
        };
        bullet.bulletHandler();
        ammo.ammoHandler();
        laser.laserHandler();
        enemy.enemyHandler();
        this.UIHandler();
        this.musicHandler();
    };

    playerDead() {
        if (this.killCount > this.record.kill) {
            this.record.kill = this.killCount;
            recordKill.textContent = Math.floor(this.record.kill);
        };
        if (this.score > this.record.score) {
            this.record.score = this.score;
            recordScore.textContent = Math.floor(this.record.score);
        };
        deathScreen.style.visibility = "visible";
        if (this.song) {
            this.song.pause();
            this.song = false
        };
    };

    mainLoop(currentTime) {
        if (this.startTime == undefined) {
            this.startTime = currentTime;
        };
        if (currentTime - this.startTime >= 1000 / 30) {
            this.startTime = currentTime;
            if (this.player.health > 0) {
                if (this.running) {
                    this.update()
                };
            } else {
                this.playerDead()
            };
        };
        requestAnimationFrame((currentTime) => this.mainLoop(currentTime))
    };
};

const play = new game()