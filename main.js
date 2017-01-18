phina.globalize();

const GBCOLOR = ['#9cb389', '#6e8464', '#40553f', '#12241A'];
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const TEXTURE_SIZE = 16;
const GRID_SIZE = 32;
const GRID_NUM_X = SCREEN_WIDTH / GRID_SIZE;
const GRID_NUM_Y = SCREEN_HEIGHT / GRID_SIZE;
const DIRECTION_UP = 0;
const DIRECTION_DOWN = 1;
const DIRECTION_LEFT = 2;
const DIRECTION_RIGHT = 3;
const FONT_SIZE = 32;
const PLAYER_SPEED = 8;
const PLAYER_INITIAL_HP = 10;
const PLAYER_TEXTURE_INDEX_DOWN = 0;
const PLAYER_TEXTURE_INDEX_UP = 1;
const PLAYER_TEXTURE_INDEX_RIGHT = 2;
const PLAYER_TEXTURE_INDEX_LEFT = 3;
const HP_LABEL_LEFT = 8;
const HP_LABEL_TOP = 8;
const ATTACK_EFFECTIVE_TIME = 20;
const DAMAGE_EFFECT_TIME = 120;
const CREATE_ENEMY_INTERVAL = 180;

const ASSETS = {
  image: {
    'player': './assets/images/player.png',
    'attack': './assets/images/attack.png',
    'enemy': './assets/images/enemy.png',
  },
 };

phina.define('MainScene', {
  superClass: 'DisplayScene',
  
  init: function() {
    this.superInit({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });
    this.backgroundColor = GBCOLOR[0];

    this.isAttacking = false;
    this.createEnemyInterval = CREATE_ENEMY_INTERVAL;

    this.enemyGroup = DisplayElement().addChildTo(this);

    this.player = Player().addChildTo(this);
    this.player.x = SCREEN_WIDTH / 2;
    this.player.y = SCREEN_HEIGHT / 2;

    this.hpLabel = Label('HP:' + this.player.hitPoint.toString(10)).addChildTo(this);
    this.hpLabel.left = HP_LABEL_LEFT;
    this.hpLabel.top = HP_LABEL_TOP;
    this.hpLabel.fill = GBCOLOR[3];
    this.hpLabel.fontSize = FONT_SIZE;
  },

  update: function(app) {
    let keyboard = app.keyboard;

    if (!this.isAttacking) {
      if (keyboard.getKey('z')) {
        this.attack = Attack().addChildTo(this);
        this.isAttacking = true;
      }

      if (keyboard.getKey('left')) {
        this.player.x -= PLAYER_SPEED;
        this.player.direction = DIRECTION_LEFT;
        this.player.setFrameIndex(PLAYER_TEXTURE_INDEX_LEFT);
      }
      if (keyboard.getKey('right')) {
        this.player.x += PLAYER_SPEED;
        this.player.direction = DIRECTION_RIGHT;
        this.player.setFrameIndex(PLAYER_TEXTURE_INDEX_RIGHT);
      }
      if (keyboard.getKey('up')) {
        this.player.y -= PLAYER_SPEED;
        this.player.direction = DIRECTION_UP;
        this.player.setFrameIndex(PLAYER_TEXTURE_INDEX_UP);
      }
      if (keyboard.getKey('down')) {
        this.player.y += PLAYER_SPEED;
        this.player.direction = DIRECTION_DOWN;
        this.player.setFrameIndex(PLAYER_TEXTURE_INDEX_DOWN);
      }
    }

    if (this.isAttacking) {

      switch (this.player.direction) {
        case DIRECTION_UP:
          this.attack.x = this.player.x;
          this.attack.y = this.player.y - GRID_SIZE;
          break;
        case DIRECTION_DOWN:
          this.attack.x = this.player.x;
          this.attack.y = this.player.y + GRID_SIZE;
          break;
        case DIRECTION_LEFT:
          this.attack.x = this.player.x - GRID_SIZE;
          this.attack.y = this.player.y;
          break;
        case DIRECTION_RIGHT:
          this.attack.x = this.player.x + GRID_SIZE;
          this.attack.y = this.player.y;
          break;
        default:
          this.attack.x = this.player.x;
          this.attack.y = this.player.y - GRID_SIZE;
          break;
      }
      this.attack.effectiveTime--;
      if (this.attack.effectiveTime < 0) {
        this.attack.remove();
        this.isAttacking = false;
      }
    }

    this.createEnemyInterval--;
    if (this.createEnemyInterval < 0) {
      this.createEnemyInterval = CREATE_ENEMY_INTERVAL;

      let enemy = Enemy().addChildTo(this.enemyGroup);
      enemy.left = GRID_SIZE * Random.randint(0, GRID_NUM_X);
      enemy.top = GRID_SIZE * Random.randint(0, GRID_NUM_Y);
    }

    this.enemyGroup.children.some(function(child) {

      if (this.isAttacking && this.attack.hitTestElement(child)) {
        child.remove();
        return;
      }
      
      if (!this.isInvincible && this.player.hitTestElement(child)) {
        this.player.hitPoint--;
        this.damageEffecrtTime = DAMAGE_EFFECT_TIME;
      }
    }, this);

    this.hpLabel.text = 'HP:' + this.player.hitPoint;
  },
});

phina.define('Player', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('player');
    this.width = TEXTURE_SIZE;
    this.height = TEXTURE_SIZE;
    this.scaleX = 2;
    this.scaleY = 2;
    this.setFrameIndex(PLAYER_TEXTURE_INDEX_UP);
    this.direction = DIRECTION_UP;
    this.hitPoint = PLAYER_INITIAL_HP;
    this.isInvincible = false;
    this.damageEffecrtTime = 0;
  },
});

phina.define('Attack', {
  superClass: 'Sprite',
  init: function() {
    this.superInit('attack');
    this.width = TEXTURE_SIZE;
    this.height = TEXTURE_SIZE;
    this.scaleX = 2;
    this.scaleY = 2;
    this.effectiveTime = ATTACK_EFFECTIVE_TIME;
  },
});

phina.define('Enemy', {
  superClass: 'Sprite',
  init: function () {
    this.superInit('enemy');
    this.width = TEXTURE_SIZE;
    this.height = TEXTURE_SIZE;
    this.scaleX = 2;
    this.scaleY = 2;
  },
});

phina.main(function() {
  let app = GameApp({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    startLabel: 'main',
    assets: ASSETS,
  });
  
  app.fps = 70;
  app.enableStats();
  app.run();
});
