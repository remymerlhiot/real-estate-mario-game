// ============================================
// CONFIGURATION ET CONSTANTES
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 32;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 4;
const MAX_FALL_SPEED = 15;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ============================================
// ÉTAT DU JEU
// ============================================
const gameState = {
    isRunning: false,
    score: 0,
    coins: 0,
    lives: 3,
    time: 400,
    world: '1-1',
    camera: { x: 0, y: 0 }
};

// ============================================
// CONTRÔLES
// ============================================
const keys = {
    left: false,
    right: false,
    up: false,
    space: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
    if (e.key === ' ') {
        keys.space = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === ' ') keys.space = false;
});

// ============================================
// CLASSE MARIO
// ============================================
class Mario {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.direction = 1; // 1 = droite, -1 = gauche
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.isJumping = false;
        this.isDead = false;
        this.isPoweredUp = false;
    }

    update() {
        if (this.isDead) return;

        // Mouvement horizontal
        if (keys.left) {
            this.velocityX = -MOVE_SPEED;
            this.direction = -1;
            this.animationTimer++;
        } else if (keys.right) {
            this.velocityX = MOVE_SPEED;
            this.direction = 1;
            this.animationTimer++;
        } else {
            this.velocityX = 0;
            this.animationTimer = 0;
        }

        // Animation de marche
        if (this.animationTimer > 8) {
            this.animationFrame = (this.animationFrame + 1) % 3;
            this.animationTimer = 0;
        }

        // Saut
        if ((keys.up || keys.space) && this.onGround && !this.isJumping) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
            this.onGround = false;
        }

        if (!keys.up && !keys.space) {
            this.isJumping = false;
        }

        // Gravité
        this.velocityY += GRAVITY;
        if (this.velocityY > MAX_FALL_SPEED) {
            this.velocityY = MAX_FALL_SPEED;
        }

        // Application des vélocités
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Collision avec le sol
        const groundLevel = CANVAS_HEIGHT - 96;
        if (this.y + this.height >= groundLevel) {
            this.y = groundLevel - this.height;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        // Limites horizontales
        if (this.x < 0) this.x = 0;
        if (this.x > level.width * TILE_SIZE - this.width) {
            this.x = level.width * TILE_SIZE - this.width;
        }

        // Collision avec les plateformes
        this.checkPlatformCollisions();

        // Collision avec les ennemis
        this.checkEnemyCollisions();

        // Collision avec les pièces
        this.checkCoinCollisions();

        // Collision avec les power-ups
        this.checkPowerUpCollisions();

        // Mort si tombe dans le vide
        if (this.y > CANVAS_HEIGHT) {
            this.die();
        }
    }

    checkPlatformCollisions() {
        const platforms = level.platforms;

        for (let platform of platforms) {
            if (this.velocityY >= 0 &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height <= platform.y &&
                this.y + this.height + this.velocityY >= platform.y) {

                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.onGround = true;

                // Bloc question
                if (platform.type === 'question' && !platform.hit) {
                    platform.hit = true;
                    this.collectCoin();
                }
            }

            // Collision par le bas (tape la tête)
            if (this.velocityY < 0 &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y >= platform.y + platform.height &&
                this.y + this.velocityY <= platform.y + platform.height) {

                this.y = platform.y + platform.height;
                this.velocityY = 0;

                // Bloc question frappé par en dessous
                if (platform.type === 'question' && !platform.hit) {
                    platform.hit = true;
                    this.collectCoin();
                }
            }

            // Collision latérale
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y + 5 &&
                this.y < platform.y + platform.height - 5) {

                if (this.velocityX > 0) {
                    this.x = platform.x - this.width;
                } else if (this.velocityX < 0) {
                    this.x = platform.x + platform.width;
                }
                this.velocityX = 0;
            }
        }
    }

    checkEnemyCollisions() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (this.collidesWith(enemy)) {
                // Si Mario tombe sur l'ennemi
                if (this.velocityY > 0 && this.y + this.height - 10 < enemy.y) {
                    enemies.splice(i, 1);
                    this.velocityY = -8;
                    gameState.score += 100;
                    updateHUD();
                } else {
                    // Mario touche l'ennemi sur le côté
                    if (!this.isPoweredUp) {
                        this.die();
                    } else {
                        this.isPoweredUp = false;
                        this.height = 32;
                    }
                }
            }
        }
    }

    checkCoinCollisions() {
        for (let i = coins.length - 1; i >= 0; i--) {
            const coin = coins[i];
            if (this.collidesWith(coin)) {
                coins.splice(i, 1);
                this.collectCoin();
            }
        }
    }

    collidesWith(object) {
        return this.x < object.x + object.width &&
               this.x + this.width > object.x &&
               this.y < object.y + object.height &&
               this.y + this.height > object.y;
    }

    collectCoin() {
        gameState.coins++;
        gameState.score += 100;
        if (gameState.coins >= 100) {
            gameState.coins -= 100;
            gameState.lives++;
        }
        updateHUD();
    }

    checkPowerUpCollisions() {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            if (powerUp.active && this.collidesWith(powerUp)) {
                powerUp.active = false;
                powerUps.splice(i, 1);

                if (powerUp.type === 'mushroom') {
                    if (!this.isPoweredUp) {
                        this.isPoweredUp = true;
                        this.height = 48;
                        this.y -= 16;
                    }
                    gameState.score += 1000;
                } else if (powerUp.type === 'flower') {
                    this.isPoweredUp = true;
                    gameState.score += 1000;
                }
                updateHUD();
            }
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.velocityY = -10;
        gameState.lives--;
        updateHUD();

        setTimeout(() => {
            if (gameState.lives <= 0) {
                gameOver();
            } else {
                resetLevel();
            }
        }, 2000);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }

        // Couleur de Mario (rouge de base, orange si powered up)
        const marioColor = this.isPoweredUp ? '#ff8800' : '#ff0000';

        // Corps
        ctx.fillStyle = marioColor;
        ctx.fillRect(-12, -12, 24, 24);

        // Chapeau
        ctx.fillStyle = marioColor;
        ctx.fillRect(-14, -16, 28, 8);

        // Visage
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(-8, -8, 16, 12);

        // Yeux
        ctx.fillStyle = '#000';
        ctx.fillRect(-6, -6, 4, 4);
        ctx.fillRect(2, -6, 4, 4);

        // Moustache
        ctx.fillStyle = '#654321';
        ctx.fillRect(-8, 0, 16, 4);

        // Animation des jambes
        if (this.velocityX !== 0 && this.onGround) {
            const legOffset = this.animationFrame === 1 ? 2 : 0;
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(-10 + legOffset, 8, 6, 8);
            ctx.fillRect(4 - legOffset, 8, 6, 8);
        } else {
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(-8, 8, 6, 8);
            ctx.fillRect(2, 8, 6, 8);
        }

        ctx.restore();
    }
}

// ============================================
// CLASSE ENNEMI
// ============================================
class Enemy {
    constructor(x, y, type = 'goomba') {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type;
        this.velocityX = -1;
        this.velocityY = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update() {
        this.animationTimer++;
        if (this.animationTimer > 20) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTimer = 0;
        }

        this.x += this.velocityX;
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        // Sol
        const groundLevel = CANVAS_HEIGHT - 96;
        if (this.y + this.height >= groundLevel) {
            this.y = groundLevel - this.height;
            this.velocityY = 0;
        }

        // Collision avec les plateformes
        for (let platform of level.platforms) {
            if (this.velocityY >= 0 &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height <= platform.y &&
                this.y + this.height + this.velocityY >= platform.y) {

                this.y = platform.y - this.height;
                this.velocityY = 0;
            }
        }

        // Rebondir sur les bords ou d'autres ennemis
        if (this.x < 0 || this.x > level.width * TILE_SIZE - this.width) {
            this.velocityX *= -1;
        }
    }

    draw() {
        if (this.type === 'goomba') {
            // Corps du Goomba
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 4, this.y + 8, 24, 24);

            // Tête
            ctx.fillStyle = '#654321';
            ctx.fillRect(this.x + 8, this.y, 16, 16);

            // Yeux
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + 10, this.y + 6, 5, 5);
            ctx.fillRect(this.x + 17, this.y + 6, 5, 5);

            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 12, this.y + 8, 3, 3);
            ctx.fillRect(this.x + 19, this.y + 8, 3, 3);

            // Pieds (animation)
            const footOffset = this.animationFrame === 0 ? 0 : 4;
            ctx.fillStyle = '#654321';
            ctx.fillRect(this.x + 2 + footOffset, this.y + 28, 8, 4);
            ctx.fillRect(this.x + 22 - footOffset, this.y + 28, 8, 4);
        }
    }
}

// ============================================
// CLASSE PIÈCE
// ============================================
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 28;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update() {
        this.animationTimer++;
        if (this.animationTimer > 10) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
    }

    draw() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.fillStyle = '#FFD700';

        // Animation de rotation de la pièce
        const scale = Math.abs(Math.cos(this.animationFrame * Math.PI / 2));
        const width = this.width * scale;

        ctx.fillRect(centerX - width / 2, centerY - 14, width, 28);

        // Détails
        ctx.fillStyle = '#FFA500';
        if (scale > 0.3) {
            ctx.fillRect(centerX - width / 3, centerY - 10, width * 0.6, 20);
        }
    }
}

// ============================================
// CLASSE POWER-UP
// ============================================
class PowerUp {
    constructor(x, y, type = 'mushroom') {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type; // 'mushroom' ou 'flower'
        this.velocityX = 2;
        this.velocityY = 0;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        this.x += this.velocityX;
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        // Sol
        const groundLevel = CANVAS_HEIGHT - 96;
        if (this.y + this.height >= groundLevel) {
            this.y = groundLevel - this.height;
            this.velocityY = 0;
        }

        // Collision avec les plateformes
        for (let platform of level.platforms) {
            if (this.velocityY >= 0 &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height <= platform.y &&
                this.y + this.height + this.velocityY >= platform.y) {

                this.y = platform.y - this.height;
                this.velocityY = 0;
            }
        }

        // Rebondir sur les bords
        if (this.x < 0 || this.x > level.width * TILE_SIZE - this.width) {
            this.velocityX *= -1;
        }
    }

    draw() {
        if (!this.active) return;

        if (this.type === 'mushroom') {
            // Chapeau du champignon
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x + 4, this.y, 24, 16);

            // Points blancs
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x + 8, this.y + 4, 6, 6);
            ctx.fillRect(this.x + 18, this.y + 4, 6, 6);

            // Tige du champignon
            ctx.fillStyle = '#FFEECC';
            ctx.fillRect(this.x + 8, this.y + 16, 16, 16);

            // Yeux
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 10, this.y + 20, 3, 3);
            ctx.fillRect(this.x + 19, this.y + 20, 3, 3);
        } else if (this.type === 'flower') {
            // Centre de la fleur
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(this.x + 12, this.y + 12, 8, 8);

            // Pétales
            ctx.fillStyle = '#FF6600';
            // Haut
            ctx.fillRect(this.x + 12, this.y + 4, 8, 8);
            // Bas
            ctx.fillRect(this.x + 12, this.y + 20, 8, 8);
            // Gauche
            ctx.fillRect(this.x + 4, this.y + 12, 8, 8);
            // Droite
            ctx.fillRect(this.x + 20, this.y + 12, 8, 8);

            // Tige
            ctx.fillStyle = '#00AA00';
            ctx.fillRect(this.x + 14, this.y + 20, 4, 12);
        }
    }
}

// ============================================
// NIVEAU
// ============================================
const level = {
    width: 200,
    platforms: [],
    pipes: []
};

function generateLevel() {
    level.platforms = [];
    level.pipes = [];

    // Plateformes en briques
    for (let i = 20; i < 30; i++) {
        level.platforms.push({
            x: i * TILE_SIZE,
            y: CANVAS_HEIGHT - 200,
            width: TILE_SIZE,
            height: TILE_SIZE,
            type: 'brick'
        });
    }

    // Blocs questions
    level.platforms.push({
        x: 16 * TILE_SIZE,
        y: CANVAS_HEIGHT - 200,
        width: TILE_SIZE,
        height: TILE_SIZE,
        type: 'question',
        hit: false
    });

    level.platforms.push({
        x: 22 * TILE_SIZE,
        y: CANVAS_HEIGHT - 200,
        width: TILE_SIZE,
        height: TILE_SIZE,
        type: 'question',
        hit: false
    });

    // Plateformes flottantes
    for (let i = 50; i < 54; i++) {
        level.platforms.push({
            x: i * TILE_SIZE,
            y: CANVAS_HEIGHT - 300,
            width: TILE_SIZE,
            height: TILE_SIZE,
            type: 'brick'
        });
    }

    // Escalier
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j <= i; j++) {
            level.platforms.push({
                x: (100 + i) * TILE_SIZE,
                y: CANVAS_HEIGHT - 96 - j * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                type: 'brick'
            });
        }
    }

    // Tuyaux
    level.pipes.push({ x: 40 * TILE_SIZE, y: CANVAS_HEIGHT - 96 - 64, height: 64 });
    level.pipes.push({ x: 60 * TILE_SIZE, y: CANVAS_HEIGHT - 96 - 96, height: 96 });
}

function drawLevel() {
    // Ciel
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sol
    const groundY = CANVAS_HEIGHT - 96;
    ctx.fillStyle = '#C84C0C';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, 32);

    // Herbe sur le sol
    ctx.fillStyle = '#00AA00';
    for (let x = -gameState.camera.x % 64; x < CANVAS_WIDTH; x += 64) {
        ctx.fillRect(x, groundY, 32, 8);
    }

    // Sol profond
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, groundY + 32, CANVAS_WIDTH, 64);

    // Nuages
    drawClouds();

    // Plateformes
    for (let platform of level.platforms) {
        const screenX = platform.x - gameState.camera.x;
        if (screenX > -TILE_SIZE && screenX < CANVAS_WIDTH) {
            if (platform.type === 'brick') {
                drawBrick(screenX, platform.y);
            } else if (platform.type === 'question') {
                drawQuestionBlock(screenX, platform.y, platform.hit);
            }
        }
    }

    // Tuyaux
    for (let pipe of level.pipes) {
        const screenX = pipe.x - gameState.camera.x;
        if (screenX > -64 && screenX < CANVAS_WIDTH) {
            drawPipe(screenX, pipe.y, pipe.height);
        }
    }
}

function drawBrick(x, y) {
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

    // Lignes de briques
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + TILE_SIZE / 2);
    ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2);
    ctx.stroke();
}

function drawQuestionBlock(x, y, hit) {
    if (hit) {
        // Bloc vide
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    } else {
        // Bloc question
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#FFA500';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

        // Point d'interrogation
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    }
}

function drawPipe(x, y, height) {
    // Corps du tuyau
    ctx.fillStyle = '#00AA00';
    ctx.fillRect(x, y, 64, height);

    // Bordures
    ctx.fillStyle = '#008800';
    ctx.fillRect(x, y, 8, height);
    ctx.fillRect(x + 56, y, 8, height);

    // Haut du tuyau
    ctx.fillStyle = '#00CC00';
    ctx.fillRect(x - 4, y - 8, 72, 8);

    ctx.fillStyle = '#008800';
    ctx.fillRect(x - 4, y - 8, 8, 8);
    ctx.fillRect(x + 64, y - 8, 8, 8);
}

function drawClouds() {
    ctx.fillStyle = '#FFFFFF';
    const cloudPositions = [100, 400, 600];

    for (let pos of cloudPositions) {
        const x = (pos - gameState.camera.x * 0.5) % (CANVAS_WIDTH + 200);
        drawCloud(x, 100);
    }
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 15, 20, 0, Math.PI * 2);
    ctx.fill();
}

// ============================================
// ENTITÉS DU JEU
// ============================================
let mario;
let enemies = [];
let coins = [];
let powerUps = [];

function initGame() {
    mario = new Mario(100, 100);
    enemies = [];
    coins = [];
    powerUps = [];

    generateLevel();

    // Ajouter des ennemis
    enemies.push(new Enemy(400, 300));
    enemies.push(new Enemy(800, 300));
    enemies.push(new Enemy(1200, 300));
    enemies.push(new Enemy(1600, 300));

    // Ajouter des pièces
    for (let i = 0; i < 20; i++) {
        coins.push(new Coin(300 + i * 100, CANVAS_HEIGHT - 250));
    }

    // Ajouter des power-ups
    powerUps.push(new PowerUp(16 * TILE_SIZE + 8, CANVAS_HEIGHT - 250, 'mushroom'));
    powerUps.push(new PowerUp(50 * TILE_SIZE, CANVAS_HEIGHT - 350, 'flower'));
}

function resetLevel() {
    mario = new Mario(100, 100);
    enemies = [];

    // Réinitialiser les ennemis
    enemies.push(new Enemy(400, 300));
    enemies.push(new Enemy(800, 300));
    enemies.push(new Enemy(1200, 300));
    enemies.push(new Enemy(1600, 300));

    gameState.camera.x = 0;
}

// ============================================
// CAMÉRA
// ============================================
function updateCamera() {
    const targetX = mario.x - CANVAS_WIDTH / 3;
    gameState.camera.x = Math.max(0, targetX);
    gameState.camera.x = Math.min(gameState.camera.x, level.width * TILE_SIZE - CANVAS_WIDTH);
}

// ============================================
// HUD
// ============================================
function updateHUD() {
    document.getElementById('score').textContent = String(gameState.score).padStart(6, '0');
    document.getElementById('coins').textContent = '×' + String(gameState.coins).padStart(2, '0');
    document.getElementById('world').textContent = gameState.world;
    document.getElementById('time').textContent = gameState.time;
    document.getElementById('lives').textContent = '×' + String(gameState.lives).padStart(2, '0');
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
    if (!gameState.isRunning) return;

    // Mise à jour
    mario.update();

    for (let enemy of enemies) {
        enemy.update();
    }

    for (let coin of coins) {
        coin.update();
    }

    for (let powerUp of powerUps) {
        powerUp.update();
    }

    updateCamera();

    // Rendu
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawLevel();

    // Dessiner les pièces
    for (let coin of coins) {
        const screenX = coin.x - gameState.camera.x;
        if (screenX > -50 && screenX < CANVAS_WIDTH) {
            ctx.save();
            ctx.translate(-gameState.camera.x, 0);
            coin.draw();
            ctx.restore();
        }
    }

    // Dessiner les power-ups
    for (let powerUp of powerUps) {
        const screenX = powerUp.x - gameState.camera.x;
        if (screenX > -50 && screenX < CANVAS_WIDTH) {
            ctx.save();
            ctx.translate(-gameState.camera.x, 0);
            powerUp.draw();
            ctx.restore();
        }
    }

    // Dessiner les ennemis
    for (let enemy of enemies) {
        const screenX = enemy.x - gameState.camera.x;
        if (screenX > -50 && screenX < CANVAS_WIDTH) {
            ctx.save();
            ctx.translate(-gameState.camera.x, 0);
            enemy.draw();
            ctx.restore();
        }
    }

    // Dessiner Mario
    ctx.save();
    ctx.translate(-gameState.camera.x, 0);
    mario.draw();
    ctx.restore();

    requestAnimationFrame(gameLoop);
}

// ============================================
// GESTION DES MENUS
// ============================================
function startGame() {
    document.getElementById('menu-screen').classList.remove('active');
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.coins = 0;
    gameState.lives = 3;
    gameState.time = 400;

    initGame();
    updateHUD();
    gameLoop();
}

function gameOver() {
    gameState.isRunning = false;
    document.getElementById('final-score').textContent = 'SCORE: ' + gameState.score;
    document.getElementById('game-over-screen').classList.add('active');
}

// ============================================
// ÉVÉNEMENTS DES BOUTONS
// ============================================
document.getElementById('start-button').addEventListener('click', startGame);

document.getElementById('restart-button').addEventListener('click', () => {
    document.getElementById('game-over-screen').classList.remove('active');
    startGame();
});

// ============================================
// INITIALISATION
// ============================================
updateHUD();
