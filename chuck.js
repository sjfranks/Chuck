/* GWAI LOS IN TIME */

//////////////////////////////////////////////////////
/*                                                  */
/*                    VARIABLES                     */
/*                                                  */
//////////////////////////////////////////////////////

//Firebase for multiplayer
//
var dataRef = new Firebase("https://gwailosintime.firebaseio.com");

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
var spearFlag = false; //if true, a spear is on screen

//Configure constants that effect game behaviour
//
var GROUND = 225; //y coordinates of the start of the ground

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
var SPEEDY = 2;
var BIG_RADIUS = 25; //the radius of the 'big' balls
var MED_RADIUS = 18;
var SMALL_RADIUS = 9;
var TINY_RADIUS = 5;
var GRAVITY = 0.7;



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
    
    //initial values
    this.x = 30;
    this.y = GROUND-PLAYER_HEIGHT;
        
    this.height = PLAYER_HEIGHT;
    this.width = PLAYER_WIDTH;

    this.update = function update() {
        playerCanvas.clearRect(this.x-2,this.y-2,this.width+4,this.height+4);
        
        if (Key.isDown(Key.LEFT)) this.moveLeft();
        if (Key.isDown(Key.RIGHT)) this.moveRight();
        
        if (touchFlag === true) {   ///What the touch controls do. This should be moved somewhere more logical
            if (touchY > 240) {
                if (touchX < 120) {
                    player.moveLeft();
                }
                else if (touchX > 120 && touchX < 240) {
                    player.moveRight();
                }
                else if (touchX > 240) {
                    if (spearFlag === false) {
                        spearFlag = true;
                        spear.init(player.x + (PLAYER_WIDTH/2));
                    }
                }
            }
        }

    };
    
    this.draw = function draw() {
        playerCanvas.fillStyle = "blue";
        playerCanvas.fillRect(this.x,this.y,player.width,player.height);
    };
    
    this.moveLeft = function moveLeft() {
        this.x -= PLAYER_SPEED;
        if (this.x < 0) this.x = 0;
    };
    
    this.moveRight = function moveLeft() {
        this.x += PLAYER_SPEED;
        if (this.x > SCREEN.width - this.width) this.x = (SCREEN.width - this.width);
    };
}

//generates a spear
function Spear() {
  
    //initialize spear at coordinate x
    this.init = function init(x) {
        this.x = x;
        this.y = GROUND-SPEAR_HEIGHT;
        this.height = SPEAR_HEIGHT;
        this.width = SPEAR_WIDTH;
        
    };
    
    this.update = function update() {
        ctx.clearRect(this.x-2, this.y-2, SPEAR_WIDTH+4, SPEAR_HEIGHT+4);
        //spear travels upwards
        if (spearFlag) {
            spear.y -= SPEAR_SPEED;
            this.height += SPEAR_SPEED;
        }
        
        //hits top of screen and disappears
        if (spear.y < 0) {
            
            ctx.clearRect(this.x-2, this.y-2, SPEAR_WIDTH+4, SCREEN.height+4);
            this.init(-50);
            spearFlag = false;
        }
    };
    
    this.draw = function draw() {
        //rope
        ctx.fillStyle = "brown";
        ctx.fillRect(this.x, this.y,this.width,(GROUND-this.y));

        //spear head
        ctx.fillStyle = "silver";
        ctx.fillRect(this.x,this.y,this.width,SPEAR_HEIGHT);
    
    };
}

//generates bubbles to be popped
function Bubble () {

    //initializes ball at coordinates x,y
    this.init = function init(x,y,size) {
        //defines ball coordinates
        this.x = x;
        this.y = y;
        
        this.radius = size;
        
        this.velocityX = SPEEDX;
        this.velocityY = SPEEDY;
    
    };
    
    
    this.update = function() {
        //Clear current image of ball
        ctx.clearRect(this.x-this.radius-2,this.y-this.radius-2,this.radius*2+4,this.radius*2+4); 
        
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        this.velocityY += GRAVITY;
        
        /*
        //make sure ball bounces only so high relative to the ground regardless of elevation 
        if (this.velocityY > 19) { 
            this.velocityY = 19;
        }
        */
        
        //If ball hits something, reverse direction
        if (this.checkHitEdgeX(this.x - this.radius) === true || 
            this.checkHitEdgeX(this.x + this.radius) === true) {  
            this.velocityX *= -1;
        }
        if (this.checkHitEdgeY(this.y - this.radius) === true || 
            this.checkHitEdgeY(this.y + this.radius) === true) {  
            this.velocityY = (this.velocityY - GRAVITY) * -1; //prevent gravity from adding at the moment that the yVel changes direction
            //(stops the ball from bouncing ever higher).
            //this.velocityX *= 0.85; //use friction to limit the horizontal bouncing.
        }
        
        if (collision(this, spear)) {
            bubbles.push(new Bubble(this.x, this.y, this.radius/2));
        }
        

    };

    this.draw = function() {
        //Draws bubble
        ctx.fillStyle = "silver";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        
        ctx.fill();
    };

    
    //checks if ball hits edges of gameboard on y axis
    this.checkHitEdgeY = function checkHitY(y) {
        if (y <= 0 ) {
            return true;
        }
        else if (y >= GROUND) {
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
            
            for (var i = 0; i < bubbles.length; i++) {
                bubbles[i].update();
                bubbles[i].draw();
            }

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

var spear = new Spear();
spear.init(-50);

var bubbles = [];
bubbles[0] = new Bubble();
bubbles[0].init(SCREEN.width/2,50, MED_RADIUS);
bubbles[1] = new Bubble();
bubbles[1].init(300, 50, BIG_RADIUS);

//Starts game
main();