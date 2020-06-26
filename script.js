// create Phaser.Game object named "game"
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'my-game',
    { preload: preload, create: create, update: update });

// declare global variables for game
var player;
var arrowKey;
var fireKey; 
var engineSound;
var space;
var asteroidGroup; var asteroidParticles;
var maxSpeed = 100;
var boomSound;
var explosion; 
var laser;
var fireSound;
var score = 0;
var scoreText;
var healthText;
var healthBar;
var livesText;
var livesBar;
var shipLives = 3;
var livesCrop;
var teleportSound;
var maxLives = 5;
var newLife = 10000;
var lifeSound;
var gameTitle;
var startText
var gameOverText;

// preload game assets - runs once at start
function preload() {
game.load.spritesheet('ship', 'assets/spaceship.png', 64,  64);
game.load.audio('engine', 'assets/engine.mp3');
game.load.image('space', 'assets/space-stars.jpg');
game.load.spritesheet('asteroid', 'assets/asteroid.png', 40, 40);
game.load.audio('boom', 'assets/boom.wav');
game.load.spritesheet('explosion', 'assets/explosion.png', 128, 128);
game.load.image('bullet', 'assets/laser.png')
game.load.audio('pew', 'assets/fire.wav');
game.load.image('particle', 'assets/asteroid-particle.png', 20, 20);
game.load.image('red-bar', 'assets/health-red.png')
game.load.image('green-bar', 'assets/health-green.png')
game.load.image('lives', 'assets/ship-lives.png');
game.load.audio('teleport', 'assets/teleport.mp3')
game.load.audio('life', 'assets/extra-life.wav')
game.load.image('title', 'assets/asteroids-2084-title.png')
}

// create game world - runs once after "preload" finished
function create() {
space = game.add.tileSprite(0, 0, 800, 600, 'space');
game.physics.startSystem(Phaser.Physics.ARCADE);
laser = game.add.weapon(10, 'bullet');
laser.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
laser.bulletSpeed = 600;
laser.fireRate = 250;

// set bullet collision area to match its visual size
laser.setBulletBodyOffset(24, 12, 6, 6);
player = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
player.anchor.set(0.5, 0.5);
player.animations.add('moving', [0, 1, 2], 10, true);
    // hide player until game starts
    player.exists = false;
game.physics.arcade.enable(player);
    player.body.setCircle(20, 12, 12);
    player.body.maxVelocity.set(400);
    player.body.drag.set(20);
    player.angle = -90;
    player.health = 100;
    player.maxHealth = 100;
    player.body.collideWorldBounds = true;
    player.events.onKilled.add(function() {
        explosion.reset(player.x, player.y);
        explosion.animations.play('explode', 30, false, true);
        shipLives = shipLives - 1;
        livesCrop = new Phaser.Rectangle(0, 0, shipLives * 25, 25);
        livesBar.crop(livesCrop);
         // respawn player if lives are left
        if (shipLives > 0) {
            player.x = game.world.centerX;
            player.y = game.world.centerY;
            player.angle = -90;
            player.body.velocity.set(0);
            player.body.acceleration.set(0);
            player.revive(player.maxHealth);
            player.alpha = 0; // start as transparent
            game.add.tween(player).to({alpha:1}, 2000, Phaser.Easing.Cubic.Out, true);

        }
        else {
            // game over
gameOverText.visible = true;
gameOverText.scale.setTo(3, 3);
game.add.tween(gameOverText).to({alpha: 1}, 1000, Phaser.Easing.Cubic.Out, true);
game.add.tween(gameOverText.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Cubic.Out, true);
game.add.tween(startText).to({alpha: 1}, 500, Phaser.Easing.Cubic.Out, true, 2000);
fireKey.onDown.addOnce(restartGame, this);
        }
        teleportSound.play();
    });
laser.trackSprite(player, 0, 0, true);
fireSound = game.add.audio('pew', 0.1);
    laser.onFire.add(function() {
        fireSound.play();
    });
asteroidGroup = game.add.group();
asteroidGroup.enableBody = true;
    // add asteroids to group
    for (var i = 0; i < 10; i++) {
        // create individual asteroid in group
        var asteroid = asteroidGroup.create(game.world.randomX, game.world.randomY, 'asteroid');
        asteroid.anchor.set(0.5, 0.5);
        asteroid.body.setCircle(15, 5, 5);
        asteroid.animations.add('spin-clock', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 16, true);
        asteroid.animations.add('spin-counter', [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 16, true);
                // randomly select animation for asteroid spinning
        if (Math.random() < 0.5) asteroid.animations.play('spin-clock');
        else asteroid.animations.play('spin-counter');
                // give asteroid random speed and direction
        asteroid.body.velocity.x = Math.random() * maxSpeed;
        if (Math.random() < 0.5) asteroid.body.velocity.x *= -1;

        asteroid.body.velocity.y = Math.random() * maxSpeed;
        if (Math.random() < 0.5) asteroid.body.velocity.y *= -1;
    }
        asteroidParticles = game.add.emitter(0, 0, 50);
    asteroidParticles.makeParticles('particle');
    asteroidParticles.gravity = 0;
    asteroidParticles.setAlpha(1, 0, 1000); // fade out after 1000 ms
explosion = game.add.sprite(game.world.centerX + 100, game.world.centerY + 100, 'explosion');
explosion.anchor.set(0.5, 0.5);
explosion.animations.add('explode', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 30,);
explosion.visible = false;
arrowKey = game.input.keyboard.createCursorKeys();
fireKey = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
fireKey.onDown.addOnce(startGame, this);
scoreText = game.add.text(20, 20,
    'Points: ' + score,
    { font: 'Arial', fontSize: '20px', fontStyle: 'bold', fill: '#ffffff' });
healthText = game.add.text(210, 20,
    'Armour',
    { font: 'Arial', fontSize: '20px', fontStyle: 'bold', fill: '#ffffff' });
game.add.image(300, 20, 'red-bar');
healthBar = game.add.image(300, 20, 'green-bar');
livesText = game.add.text(590, 20,
    'Soap Bars',
    { font: 'Arial', fontSize: '16px', fontStyle: 'bold', fill: '#ffffff' });
engineSound = game.add.audio('engine', 0.3);
engineSound.loop = true;
engineSound.play();
boomSound = game.add.audio('boom', 0.3);
boomSound.loop = false;
teleportSound = game.add.audio('teleport', 0.5);
lifeSound = game.add.audio('life', 0.5);
livesBar = game.add.image(665, 20, 'lives');
    livesCrop = new Phaser.Rectangle(0, 0, shipLives * 25, 25);
    livesBar.crop(livesCrop);
gameTitle = game.add.image(game.world.centerX, game.world.centerY + 100, 'title');
gameTitle.anchor.set(0.5, 0.5);
gameTitle.scale.setTo(0.75, 0.75);
startText = game.add.text(game.world.centerX, game.world.centerY - 200,
    'Press Spacebar to Begin',
    { font: 'Arial', fontSize: '30px', fontStyle: 'bold', fill: '#00ff00' });
  startText.anchor.set(0.5, 0.5);
gameOverText = game.add.text(game.world.centerX, game.world.centerY + 100,
    'You are dead',
    { font: 'Arial', fontSize: '48px', fontStyle: 'bold', fill: '#ff0000' });
  startText.anchor.set(0.5, 0.5);
gameOverText.anchor.set(0.5, 0.5);
gameOverText.visible = false;
}

// update gameplay - runs in continuous loop after "create" finished
function update() {
 game.physics.arcade.collide(player, asteroidGroup, collideAsteroid, null, this);
 game.physics.arcade.collide(laser.bullets, asteroidGroup, shootAsteroid, null, this);
    if (arrowKey.left.isDown) {
        // rotate player counter-clockwise (negative value)
        player.body.angularVelocity = -200;
    }
    else if (arrowKey.right.isDown) {
        // rotate player clockwise (positive value)
        player.body.angularVelocity = 200;
    }
    else {
        // stop rotating player
        player.body.angularVelocity = 0;
    }
  

    if (arrowKey.up.isDown && player.exists) {
        // accelerate player forward
        game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration);
        player.animations.play('moving');
        engineSound.volume = 1;
    }
    else {
        // stop accelerating player
        player.body.acceleration.set(0);
        player.animations.stop();
        player.frame = 1;
        engineSound.volume = 0.3;
    }
    if (fireKey.isDown && player.exists) {
      laser.fire();
    }
          // keep player onscreen (instead of collideWorldBounds)
    // will allow space tilesprite to keep scrolling
    if (player.left <= 50) player.left = 50;
    else if (player.right >= game.world.width - 50) player.right = game.world.width - 50;

    if (player.top <= 50) player.top = 50;
    else if (player.bottom >= game.world.height - 50) player.bottom = game.world.height - 50;
    // scroll space tilesprite in opposite direction of player velocity
    space.tilePosition.x = space.tilePosition.x - player.body.velocity.x / 40;
    space.tilePosition.y = space.tilePosition.y - player.body.velocity.y / 40;
        asteroidGroup.forEach(function (asteroid) {
        game.world.wrap(asteroid, 20);
    });
        if (Math.random() < 0.02) {
        var asteroid = asteroidGroup.getFirstDead();
        if (asteroid) {
            // reset asteroid at random position in game
            asteroid.reset(game.world.randomX, game.world.randomY);

            // give asteroid random speed and direction
            asteroid.body.velocity.x = Math.random() * maxSpeed;

            // make asteroid fade into view
            asteroid.alpha = 0; // start as transparent
            game.add.tween(asteroid).to({alpha: 1}, 500, Phaser.Easing.Cubic.Out, true);
        }
    }
}
function collideAsteroid(player, asteroid){
asteroidParticles.x = asteroid.x;
asteroidParticles.y = asteroid.y;
asteroidParticles.explode(1000, 5);
asteroid.kill();
boomSound.volume = 1;
boomSound.play();
player.damage(25);
healthBar.scale.setTo(player.health / player.maxHealth, 1);
game.camera.shake(0.02, 250);
}
function shootAsteroid(bullet, asteroid){
asteroidParticles.x = asteroid.x;
asteroidParticles.y = asteroid.y;
asteroidParticles.explode(1000, 5);
asteroid.kill();
bullet.kill();
boomSound.volume = 1;
boomSound.play();
maxSpeed = maxSpeed + 1; 
score = score + 250;
scoreText.text = 'Points: ' + score; 
checkNewLife();
}
function checkNewLife() {
      if (score >= newLife) {
        if (shipLives < maxLives) {
            // award extra life
        shipLives = shipLives + 1;
        livesCrop = new Phaser.Rectangle(0, 0, shipLives * 25, 25);
        livesBar.crop(livesCrop);
        lifeSound.play();
        game.camera.flash(0x00ff00, 500);
        }
        // maxLives already reached
        else if (player.health < player.maxHealth) {
            // replenish health instead
            player.health = player.maxHealth
            healthBar.scale.setTo(player.health / player.maxHealth, 1);
            lifeSound.play();

        }
        // increase score needed for next new life
        newLife = newLife + 10000;
    }
}
function startGame() {
      // fade out start text
    game.add.tween(startText).to({alpha: 0}, 250, Phaser.Easing.Cubic.Out, true);

    // fade out and zoom out game title (after slight delay)
    game.add.tween(gameTitle).to({alpha: 0}, 3000, Phaser.Easing.Cubic.Out, true, 250);
    game.add.tween(gameTitle.scale).to({x: 3, y: 3}, 3000, Phaser.Easing.Cubic.Out, true, 250);

    // fade in player
    teleportSound.play();
    player.exists = true;
    game.add.tween(player).to({alpha: 1}, 200, Phaser.Easing.Cubic.Out, true);

}
function restartGame() {
  score = 0;
  shipLives = 3;
  newLife = 10000;
  maxSpeed = 100;
  game.state.restart(); 
}
// add custom functions (for collisions, etc.)
//