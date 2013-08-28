/* GWAI LOS IN TIME */

//////////////////////////////////////////////////////
/*                                                  */
/*                    VARIABLES                     */
/*                                                  */
//////////////////////////////////////////////////////

//Drawing variables
//
var SCREEN = document.getElementById("screen");
var CONTROLLER = document.getElementById("controller");
var BACKGROUND = document.getElementById("background");

var ctx = SCREEN.getContext("2d");
var controller = CONTROLLER.getContext("2d");
var background = BACKGROUND.getContext("2d");

//Controller variables
//
var touchable = 'createTouch' in document;
var touchX;
var touchY;

//Random variables that make the game work
//
var gameState = "game";  //determines game state to switch between menus etc.
var bubbles = []; //array of bouncing bubbles

//Configure constants that effect game behaviour
//

var GROUND = 214; //y coordinates of the start of the ground

var PLAYER_SPEED = 2;  
var PLAYER_HEIGHT = 40;
var PLAYER_WIDTH = 20;





//////////////////////////////////////////////////////
/*                                                  */
/*                FUNCTION LIBRARY                  */
/*                                                  */
//////////////////////////////////////////////////////

//shim for requesting animation frames from the browser
window.requestAnimFrame = (function(){
  return   window.requestAnimationFrame   ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 60);
      };
})();

//function that checks if two rectangles overlap, for use in collision detection
function collision(r1, r2) {
    return !(r2.left > r1.right
        || r2.right < r1.left
        || r2.top > r1.bottom
        || r2.bottom < r1.top);
}

//generates/controls/draws player
function Player() {
    
    //initialize player at coordinates x, y
    this.init = function init(x,y) {
        this.x = x;
        this.y = y;
        
        this.height = PLAYER_HEIGHT;
        this.width = PLAYER_WIDTH;
    };
    
    this.draw = function draw() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x,this.y,player.width,player.height);
    };
    
    this.moveLeft = function moveLeft() {
        ctx.clearRect(this.x,this.y,this.width,this.height);
        this.x -= PLAYER_SPEED;
    };
    
    this.moveRight = function moveLeft() {
        ctx.clearRect(this.x,this.y,this.width,this.height);
        this.x += PLAYER_SPEED;
    };
    
    
}


//////////////////////////////////////////////////////
/*                                                  */
/*                 INPUT LISTENERS                  */
/*                                                  */
//////////////////////////////////////////////////////

//Keyboard listener
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

Player.prototype.update = function() {
  if (Key.isDown(Key.LEFT)) this.moveLeft();
  if (Key.isDown(Key.RIGHT)) this.moveRight();
};

//Touch listener
if(touchable) {
    document.addEventListener( 'touchstart', onTouchStart, false );
	document.addEventListener( 'touchmove', onTouchMove, false );
	document.addEventListener( 'touchend', onTouchEnd, false );
}

function onTouchStart(event) {
    event.preventDefault();
    
    var touch = event.touches[0]; 
    
    touchX = touch.pageX;
    touchY = touch.pageY;
    
    if (touchY > 240) {
        if (touchX < 120) {
            alert("left"); 
        }
        else if (touchX > 120 && touchX < 240) {
            alert("right");
        }
        else if (touchX > 240) {
            alert("shoot");
        }
    }
    
    
    
}

function onTouchMove(event) {
     // Prevent the browser from doing its default thing (scroll, zoom)
	event.preventDefault(); 
    
    var touch = event.touches[0]; 
    
    touchX = touch.pageX;
    touchY = touch.pageY;
    
} 

function onTouchEnd(event) { 
    
}



//////////////////////////////////////////////////////
/*                                                  */
/*                 MAIN GAME LOOP                   */
/*                                                  */
//////////////////////////////////////////////////////

//Main game loop
function main() {

    switch (gameState) {
        case "game":
            
            player.update();
            player.draw();
            
            break;
    }
    
    requestAnimFrame(function() {  //request new frame of animation
        main();
    });
}


//Draws D-Pad
controller.fillStyle = "blue";  //left button
controller.fillRect(0,0,119,80);
controller.fillStyle = "green"; //right button
controller.fillRect(120,0,119,80);
controller.fillStyle = "red";  //input button
controller.fillRect(240,0,240,80);

controller.font="30px Verdana";
controller.fillStyle = "black";
controller.fillText("L", 45,50);
controller.fillText("R", 165,50);
controller.fillText("X", 345,50);

//Draws background
background.fillStyle = "firebrick";
background.fillRect(0,GROUND,BACKGROUND.width,BACKGROUND.height-GROUND);

//Initialize shit
var player = new Player();
player.init(30,(GROUND-PLAYER_HEIGHT));

//Starts game
main();