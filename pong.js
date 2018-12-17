/** Class representing a 2 dimensional point. */
class Point {
  constructor(x, y) {
    this.x_ = x;
    this.y_ = y;
  }
  /**
   * @type {int}
   */
  get posX() {
    return this.x_;
  }
  /**
   * @type {int}
   */
  get posY() {
    return this.y_;
  }
  equals(p) {
    if(p.posX == this.posX && p.posY == this.posY) return true;
    else return false;
  }
}

/** Model Class representing a virtual world. */
class WorldModel {
  constructor(ach, w, h) {
    this.ach_ = ach;
    this.width_ = w || 100;
    this.height_ = h || 50;
    this.views_ = [];
    this.actors_ = [];
    this.score_ = {L: 0, R: 0};
  }
  
  update(steps) {
    this.actors_.forEach(x => x.update(steps));
    if(!(this.views_ == [])) {
      this.views_.forEach(x => x.display(this));
    }


  }
  /**
   * @type {tuple}
   */
  get actors() {
    return new ArrayIterator(this.actors_);
  }
  /**
   * @type {int}
   */
  get width() {
    return this.width_;
  }
  /**
   * @type {int}
   */
  get height() {
    return this.height_;
  }
  get view() {
    return this.views_[0];
  }
  addActor(a) {
    if(a instanceof Actor) {
      this.actors_.push(a);
    }
    else throw new Error("Must be given a valid actor.");
  }
  addView(v) {
    if(v instanceof View) {
      this.views_.push(v);
    }
    else throw new Error("Must be given a valid view.");
  }
  reset() {
    this.views_.forEach(x => x.dispose());
    this.views_ = [];
    this.actors_ = [];
  }
}

class PongController {
  constructor(world, paddle) {
    if(world instanceof WorldModel) {
      this.paddleWorld_ = world;
    }
    else throw new Error("Not given a valid WorldModel");
    if(paddle instanceof Paddle) {
      this.paddle_ = paddle;
    }
    else throw new Error("Not given a valid Paddle");
  }
  /**
   * Turns the paddle up.
   */
  turnPaddleUp() {
    this.paddle_.turnUp();
  }
  /**
   * Turns the paddle down.
   */
  turnPaddleDown() {
    this.paddle_.turnDown();
  }
  /**
   * @type {tuple}
   */  
  get paddlePosition() {
    return this.paddle_.position;
  }
  /**
   * @type {string}
   */  
  get paddleDirection() {
    return this.paddle_.direction;
  }
  /**
   * @type {int}
   */  
  get worldHeight() {
    return this.paddleWorld_.height;
  }
  /**
   * @type {int}
   */  
  get worldWidth() {
    return this.paddleWorld_.width;
  }
}


class Player {
  constructor(pongController) {
    if(!(pongController instanceof PongController)) throw new Error("Not given a valid Pong Controller.");
    else this.pc_ = pongController;
    if(this.constructor === Player) throw new Error("Cannot instantiate a Player, which is an abstract base class");
  }
}

/** Class representing a Human Player of the snake game. */
class HumanPlayer extends Player {
  constructor(pongController, inputHandler) {
    super(pongController);
    this.inputHandler_ = inputHandler;
  }
  makeTurn() {
    if(this.inputHandler_.madeUpMove() == true) {
      this.pc_.turnPaddleUp();
      this.inputHandler_.resetUpMove();
    }
    else if(this.inputHandler_.madeDownMove() == true) {
      this.pc_.turnPaddleDown();
      this.inputHandler_.resetDownMove();
    }
    else {

    }
  }
}

/** Interface class that ensures any type of view has a display method.*/
class View {
  constructor() {
    if(this.constructor === View) throw new Error("Cannot instantiate a View, which is an interface");
    else if(!(this.display instanceof Function)) throw new Error("View class must implement display method.");
    else if(!(this.dispose instanceof Function)) throw new Error("View class must implement dispose method.");
  }
}

/** Class representing what our player sees on their screen.*/
class CanvasView extends View {
  constructor(scalingFactor) {
    super();
    this.scalingFactor_ = scalingFactor;
    this.canvas_ = document.createElement("canvas");
    this.canvas_.id = "game";
    document.body.appendChild(this.canvas_);
    this.context_= this.canvas_.getContext("2d");
  }
  
  display(world) {
    this.canvas_.width = this.scalingFactor_*world.width;
    this.canvas_.height = this.scalingFactor_*world.height;
    this.context.fillText(world.score.L + " : " + world.score.R, 10, 50);
    world.actors.forEach(x => {
      this.context_.fillStyle = x.color || "white";
      if(x.type === "Ball") {
        this.context_.arc(x.position.posX*this.scalingFactor_, x.position.posY*this.scalingFactor_, this.scalingFactor_,0,2*Math.PI,);
        this.context.stroke();
        this.context.fill();
      }
      else this.context_.fillRect(x.position.posX*this.scalingFactor_, x.position.posY*this.scalingFactor_, this.scalingFactor_, this.scalingFactor_);
    });
  }
  dispose() {
    document.body.removeChild(this.canvas_);
  }
}

class InputHandler {
  constructor() {
    if(!(this.madeUpMove instanceof Function)) throw new Error("input handler must have madeUpMove method");
    if(!(this.madeDownMove instanceof Function)) throw new Error("input handler must have madeDownMove method");
    if(!(this.resetUpMove instanceof Function)) throw new Error("input handler must have resetUpMove method");
    if(!(this.resetDownMove instanceof Function)) throw new Error("input handler must have resetDownMove method");
  }
}

class KeyInputHandler extends InputHandler {
  constructor() {
    super();
    this.wasUpPushed_ = false;
    this.wasDownPushed_ = false;
  }
  madeUpMove() {
    return this.wasUpPushed_;
  }
  madeDownMove() {
    return this.wasDownPushed_;
  }
  resetUpMove() {
    this.wasUpPushed_ = false;
  }
  resetDownMove() {
    this.wasDownPushed_ = false;
  }
}

class UDKeyInputHandler extends KeyInputHandler {
  constructor() {
    super();
    let eventHandler = event => {
      if(event.key === "ArrowUp") {
        this.wasUpPushed_ = true;
      }
      else if(event.key === "ArrowDown") {
        this.wasDownPushed_ = true;
      }
    }
    window.addEventListener("keydown", eventHandler);  
  }
}

class WSKeyInputHandler extends KeyInputHandler {
  constructor() {
    super();
    let eventHandler = event => {
      if(event.keyCode === 87) {
        this.wasUpPushed_ = true;
      }
      else if(event.keyCode === 83) {
        this.wasDownPushed_ = true;
      }
    }
    window.addEventListener("keydown", eventHandler);  
  }
}


class ActorCollisionHandler {
  constructor() {
    this.pairs_ = new Map();
  }
  toKey_(colliderType, collidedType) {
    return colliderType + ", " + collidedType;
  }
  addCollisionAction(colliderType, collidedType, actionApplicator) {
    this.pairs_.set(this.toKey_(colliderType, collidedType), actionApplicator);
  }
  hasCollisionAction(colliderType, collidedType) {
    return this.pairs_.has(this.toKey_(colliderType, collidedType));
  }
  applyCollisionAction(collider, collided) {
    if(this.hasCollisionAction(collider.type, collided.type)) {
      this.pairs_.get(this.toKey_(collider.type, collided.type)).applyAction(collider, collided);
    }
  }
}

class GameController {
  constructor(game, maxScore) {
    this.game_ = game;
    this.maxScore_ = maxScore;
    let Handler = new ActorCollisionHandler;
    this.world_ = new WorldModel(Handler, 100, 50);
    this.players_ = [];
  }
  init(data) {
    let arr = [new UDKeyInputHandler, new WSKeyInputHandler];
    let myCols = ["red", "blue"];
    let compCols = ["green", "orange"]
    if((data.numOfHumanPlayers !== 0) && (data.numOfHumanPlayers < 3)) {
      for(let i=0; i < (data.numOfHumanPlayers); i++) {
        let value = null;
        let p = new Point(value, value);
        let myPaddle = new Paddle(p, myCols[i]);
        let pc = new PaddleController(this.world_, myPaddle);
        let player = new HumanPlayer(pc, arr[i]);
        this.player = player;
        this.world_.addActor(myPaddle);
      }
    }
    if(data.numOfHumanPlayers > 2) {
      
    }
    if((data.numOfAIPlayers !== 0) && (data.numOfAIPlayers < 3))  {
      for(let i=0; i < (data.numOfAIPlayers); i++) {
        let value = null;
        let p = new Point(value, value);
        let myPaddle = new Paddle(p, compCols[i]);
        let pc = new PaddleController(this.world_, myPaddle);
        let player = new AIPlayer(pc, 1);
        this.player = player;
        this.world_.addActor(myPaddle);
      }
    }
    this.world_.addView(new CanvasView(10));
    this.run();
  }
  
  set player(p) {
    if(p instanceof Player) {
      this.players_.push(p);
    }
    else throw new Error("Must provide a valid player.");
  }

  get score() {
    return this.score_;
  }

  run() {
    let lastTime = 0;
    let giveTime = milliseconds => {
      lastTime = milliseconds;
      requestAnimationFrame(updateFrame);
    }
    let updateFrame = milliseconds => {
      this.players_.forEach(x => x.makeTurn());
      if((milliseconds - lastTime) > 200){
        this.world_.update(1);
        lastTime = lastTime + 200;
      }
      if(this.world_.score.L === this.maxScore_ || this.world_.score.R === this.maxScore_) {
        console.log("sorry, I have to reset");
        this.players_ = [];
        this.world_.reset();
        this.game_.switchContext();
      }
      else requestAnimationFrame(updateFrame);
    }
    if(this.players_.length > 0) {
      requestAnimationFrame(giveTime);
    }
    else {
      this.players_ = [];
      this.world_.reset();
      this.game_.switchContext();
    }
  }
}

class Actor {
  constructor() {
    if(this.constructor===Actor) throw new Error("Cannot instantiate an Actor which is an interface.");
    else if(!(this.update instanceof Function)) throw new Error("Actor must have an update method.");
  }
}

class Collidable extends Actor {
  constructor() {
    super();
    if(this.constructor === Collidable) throw new Error("Cannot instantiate a Collidable which is an interface.");
    else if(!(this.didCollide instanceof Function)) throw new Error("Collidable must have a didCollide method.");
  }
}

class Wall extends Actor {
  constructor(x, y) {
    super();
    this.position_ = new Point(x, y);
  }
  get position() {
    return this.position_;
  }
  get type() {
    return "Wall";
  }
  update() {

  }
}

class CollisionHandler {
  constructor() {
    if(this.constructor === CollisionHandler) throw new Error("Cannot instantiate a CollisionHandler which is an Interface.");
    else if(!(this.applyAction instanceof Function)) throw new Error("Collision Handler must have an applyAction method.");
  }
}

class PaddleBallCollisionHandler extends CollisionHandler {
  constructor() {
    super();
  }
  applyAction(paddle, ball) {
    ball.reflectAngle();
  }
}

class WallBallCollisionHandler extends CollisionHandler {
  constructor() {
    super();
  }
  applyAction(wall, ball) {
    ball.reflectAngle();
  }
}

class GoalBallCollisionHandler extends CollisionHandler {
  constructor() {
    super();
  }
  applyAction(goal, ball) {
    ball.score();
  }
}

class ArrayIterator {
  constructor(arr) {
    this.arr_ = arr;
    this.index_ = 0;
  }
  next() {
    let ind = this.index_++;
    let done = (ind === this.arr_.length)
    let value = (done) ? undefined : this.arr_[ind];
    return {value: value, done: done};
  }
  forEach(f) {
    this.arr_.forEach(x => f(x));
  }
}

class MainMenuController {
  constructor(game) {
    this.game_ = game;
    this.twoHumansButton_ = document.createElement("button");
    this.oneEachButton_ = document.createElement("button");
    this.twoCompsButton_ = document.createElement("button");
    this.twoHumansButton_.appendChild(document.createTextNode("Play with 2 Players!"));  
    this.twoHumansButton_.addEventListener("click", this.switchContext_({H: 2, C: 0}).bind(this));
    this.oneEachButton_.appendChild(document.createTextNode("Play against an AI!"));  
    this.oneEachButton_.addEventListener("click", this.switchContext_({H: 1, C: 1}).bind(this));
    this.twoCompsButton_.appendChild(document.createTextNode("Watch 2 AI!"));  
    this.twoCompsButton_.addEventListener("click", this.switchContext_({H: 0, C: 2}).bind(this));
  }
  init(data) {
    document.getElementById("game-area").appendChild(this.twoHumansButton_);
    document.getElementById("game-area").appendChild(this.oneEachButton_);
    document.getElementById("game-area").appendChild(this.twoCompsButton_);
  }
  switchContext_(myPlayers) {
    document.getElementById("game-area").removeChild(this.twoHumansButton_);
    document.getElementById("game-area").removeChild(this.oneEachButton_);
    document.getElementById("game-area").removeChild(this.twoComps_);
    this.game_.switchContext({numOfHumanPlayers: myPlayers.H, numOfAIPlayers: myPlayers.C});
  }
}

class Game {
  constructor () {
    this.contextSwitches_ = new Map();
    this.contextSwitches_.set("Start", "Game");
    this.contextSwitches_.set("Game", "Start");
    this.controllers_ = new Map();
    this.controllers_.set("Start", new MainMenuController(this));
    this.controllers_.set("Game", new GameController(this));
    this.currentContext_ = "Start";
  }
  switchContext(data) {
    this.currentContext_ = this.contextSwitches_.get(this.currentContext_);
    this.controllers_.get(this.currentContext_).init(data);
  }
  run(data) {
    this.controllers_.get(this.currentContext_).init(data);
  }
}

let hereWeGo = new Game();
hereWeGo.run();




/*************************/
/**
 * Need Goal class
 * Need AI class
 * need scorekeeper class
/*
*/

class Paddle extends Actor {
  constructor(point, length, color) {
    super();
    if(point instanceof Point) {
      this.parts_ = [point]; 
    }
    else throw new Error("Must be given a valid Point.");
    for(let index=1; index < (length - 1); index++) this.parts_.push(new Point(point.posX, point.posY + index));
    this.color_ = color || "white";
    this.currentDirection_ = "none";
  }
  move(steps) {
    if(this.currentDirection_ === "Up") {
      this.position_ = new Point((this.position_.posX - steps), this.position.posY);
    }
    else if(this.currentDirection === "Down") {
      this.position_ = new Point((this.position_.posX + steps), this.position.posY);
    }
    else {

    }
  }
  update(steps) {
    this.move(steps);
  }
  get position() {
    return this.parts_[0];
  }
  get parts() {
    return new ArrayIterator(this.parts_);
  }
  get direction() {
    return this.currentDirection_;
  }
  get color() {
    return this.color_;
  }
  get length() {
    return this.length;
  }
  get type() {
    return "Paddle";
  }
  turnUp() {
    this.currentDirection_ = "Up";
  }
  turnDown() {
    this.currentDirection_ = "Down";
  }
}

class Ball extends Collidable {
  constructor(x, y, theta, color) {
    super();
    this.theta_ = theta || 0;
    this.position_ = new Point(x, y);
    this.color_ = color || "white";
    this.isActive_ = true;
  }
  move(steps) {
    this.position_ = new Point(this.position_.posX + (steps*Math.round(Math.cos((this.theta_*Math.PI)/180))), this.position_.posY + (steps*Math.round(Math.sin((this.theta_*Math.PI)/180))));
  }
  update(steps) {
    this.move(steps);
  }
  didCollide(a) {
    if(a.type === "Paddle") {
      let it = a.parts;
      let placeHolder = it.next();
      while(!placeHolder.done && !(this.position.equals(placeHolder.value))) {
        placeHolder = it.next();
      }
      if(placeHolder.done) {
        return false;
      }
      else return true;
    }
    else return this.position.equals(a);
  }
  reflectAngle() {
    let phi = Math.Round((Math.asin(Math.cos((this.theta_*Math.PI)/180))*180)/Math.PI);
    if(this.theta_ <= 90 && this.theta_ > 0) {
      this.theta_ = (90 + phi) % 360;
    }
    else if(this.theta_ <= 180 && this.theta_ > 90) {
      this.theta_ = (90 - phi) % 360;
    }
    else if(this.theta_ <= 270 && this.theta_ > 180) {
      this.theta_ = (270 + phi) % 360;
    }
    else this.theta_ = (270 - phi) % 360;
  }
  get isActive() {
    return this.isActive_;
  }
  get position() {
    return this.position_;
  }
  get theta() {
    return this.theta_;
  }
  get color() {
    return this.color_;
  }
  get type() {
    return "Ball"
  }
  score() {
    this.isActive_ = false;
  }
}
