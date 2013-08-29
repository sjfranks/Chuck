/* GWAI LOS IN TIME */

//////////////////////////////////////////////////////
/*                                                  */
/*                    VARIABLES                     */
/*                                                  */
//////////////////////////////////////////////////////

//Firebase for multiplayer
//
//var dataRef = new Firebase("https://gwailosintime.firebaseio.com");

//Drawing variables
//
var PLAYER = document.getElementById("player"); //canvas with the player sprite on it
var SCREEN = document.getElementById("screen"); //canvas with balls and spears
var CONTROLLER = document.getElementById("controller"); //canvas with the controller
var BACKGROUND = document.getElementById("background"); //canvas with the background image

var ctx = SCREEN.getContext("2d");
var playerCanvas = PLAYER.getContext("2d");
var controller = CONTROLLER.getContext("2d");
var background = BACKGROUND.getContext("2d");

//Controller variables
//
var touchable = 'createTouch' in document;
var touchX;
var touchY;
var touchFlag = false; //indicates something is touching

//Random variables that make the game work
//
var gameState = "game";  //determines game state to switch between menus etc.
var spearFlag = false;

//Configure constants that effect game behaviour
//
var GROUND = 214; //y coordinates of the start of the ground

//player attributes
var PLAYER_SPEED = 2;  
var PLAYER_HEIGHT = 40;
var PLAYER_WIDTH = 20;

//spear attributes
var SPEAR_SPEED = 5;
var SPEAR_HEIGHT = 10;
var SPEAR_WIDTH = 5;

//bubble attributes
var SPEEDX = 3;
var SPEEDY = 5;
var RADIUS = 20;





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

//function that checks if circle and rectangle overlap, for use in collision detection
function collision(circle, rect) {
    var circleDistanceX = Math.abs(circle.x - rect.x);
    var circleDistanceY = Math.abs(circle.y - rect.y);

    if (circleDistanceX > (rect.width/2 + circle.radius)) { return false; }
    if (circleDistanceY > (rect.height/2 + circle.radius)) { return false; }

    if (circleDistanceX <= (rect.width/2)) { return true; } 
    if (circleDistanceY <= (rect.height/2)) { return true; }

    var cornerDistance_sq = (circleDistanceX - rect.width/2)^2 +
                         (circleDistanceY - rect.height/2)^2;

    if (cornerDistance_sq <= (circle.r^2)) { return true; }

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
    
    this.update = function update() {
        if (Key.isDown(Key.LEFT)) this.moveLeft();
        if (Key.isDown(Key.RIGHT)) this.moveRight();
        
        if (touchFlag === true) {
            if (touchY > 240) {
                if (touchX < 120) {
                    player.moveLeft();
                }
                else if (touchX > 120 && touchX < 240) {
                    player.moveRight();
                }
                else if (touchX > 240) {
                }
            }
        }

    };
    
    this.draw = function draw() {
        playerCanvas.fillStyle = "blue";
        playerCanvas.fillRect(this.x,this.y,player.width,player.height);
    };
    
    this.moveLeft = function moveLeft() {
        playerCanvas.clearRect(this.x,this.y,this.width,this.height);
        this.x -= PLAYER_SPEED;
        if (this.x < 0) this.x = 0;
    };
    
    this.moveRight = function moveLeft() {
        playerCanvas.clearRect(this.x,this.y,this.width,this.height);
        this.x += PLAYER_SPEED;
        if (this.x > SCREEN.width - this.width) this.x = (SCREEN.width - this.width);
    };
}

//generates a spear
function Spear() {
    //initialize spear at coordinate x
    this.init = function init(x) {
        this.x = x;
        this.y = GROUND;
        
        this.height = SPEAR_HEIGHT;
        this.width = SPEAR_WIDTH;

    };
    
    this.update = function update() {
        //if (collision(bubble, this)) {
        //    alert("Popped!");
        //}
        
        ctx.clearRect(this.x, this.y, SPEAR_WIDTH, SPEAR_HEIGHT);
        //spear travels upwards
        if (spearFlag) {
            spear.y -= SPEAR_SPEED;
        }
        
        //hits top of screen and disappears
        if (spear.y < 0) {
            ctx.clearRect(this.x, this.y, SPEAR_WIDTH, SCREEN.height);
            this.init(-50);
            spearFlag = false;
        }
    };
    
    this.draw = function draw() {
        //spear head
        ctx.fillRect(this.x,this.y,SPEAR_WIDTH,SPEAR_HEIGHT);
    };
}

//generates bubbles to be popped
function Bubble () {

    //initializes ball at coordinates x,y
    this.init = function init(x,y) {
        //defines ball coordinates
        this.x = x;
        this.y = y;
        
        //defines which direction the ball is moving
        this.dX = true;      //if true, it's going right
        this.dY = false;     //if true, it's going down
        
        this.radius = RADIUS;
        
    };
    
    
    this.draw = function() {
        //Clear current image of ball
        ctx.clearRect(this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2); 
        
        //If ball hits something, reverse direction
        if (this.checkHitEdgeX(this.x) === true || 
            this.checkHitEdgeX(this.x + this.radius) === true) {  
            this.dX = !this.dX;
        }
        if (this.checkHitEdgeY(this.y) === true || 
            this.checkHitEdgeY(this.y + this.radius) === true) {  
            this.dY = !this.dY;
        }
        
        //Moves ball
        if (this.dX === true) {  //remember: if true it's going right
            this.x += SPEEDX;    
        }
        else if (this.dX === false) {
            this.x -= SPEEDX;
        }
        if (this.dY === false) {  //remember: if true it's going down
            this.y -= SPEEDY;    
        }
        else if (this.dY === true) {
            this.y += SPEEDY;
        }
    
        //Draws bubble
        ctx.fillStyle = "silver";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        
        ctx.fill();
        
        //ctx.strokeRect(this.x-this.radius, this.y-this.radius, this.radius*2,this.radius*2);
    };
    
    //checks if ball hits edges of gameboard on y axis
    this.checkHitEdgeY = function checkHitY(y) {
        if (y < 0 ) {
            return true;
        }
        else if (y > GROUND) {
            return true;
        }
        else {
            return false;
        }    
    };
    
    //cchecks if ball hit edges of gameboard on X axis
    this.checkHitEdgeX = function checkHitX(x) {
        if (x >= SCREEN.width ) {
            return true;
        }
        else if (x < 0 ) {
            return true;
        }
        else {
            return false;
        }
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
  SPACE: 32,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
    
    if (event.keyCode == 32) {
        // Spacebar
        if (spearFlag === false) {
            spearFlag = true;
            spear.init(player.x + (PLAYER_WIDTH/2));
        }
    }
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
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
    touchFlag = true;

}

function onTouchMove(event) {
     // Prevent the browser from doing its default thing (scroll, zoom)
	event.preventDefault(); 
    
    var touch = event.touches[0]; 
    
    touchX = touch.pageX;
    touchY = touch.pageY;
    
} 

function onTouchEnd(event) { 
    
    touchFlag = false;
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
            spear.update();

            bubble.draw();
            spear.draw();
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
//myDataRef.push({playerx: player.x, playery: player.y});

var spear = new Spear();
spear.init(-50);

var bubble = new Bubble();
bubble.init(30,30);

//Starts game
main();