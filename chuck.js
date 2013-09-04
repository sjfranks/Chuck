/* GWAI LOS IN TIME */

//////////////////////////////////////////////////////
/*                                                  */
/*                    VARIABLES                     */
/*                                                  */
//////////////////////////////////////////////////////

//Firebase for multiplayer
//
var dataRef = new Firebase("https://gwailosintime.firebaseio.com");

// Menu drawing variables
//
var menuPosition = 0;  //moves the cursor between different items on the main menu

//Game drawing variables
//
var PLAYER = document.getElementById("player"); //canvas with the player sprite on it
var SCREEN = document.getElementById("screen"); //canvas with balls and spears
var CONTROLLER = document.getElementById("controller"); //canvas with the controller
var BACKGROUND = document.getElementById("background"); //canvas with the background image

var ctx = SCREEN.getContext("2d");
var playerCanvas = PLAYER.getContext("2d");
var controller = CONTROLLER.getContext("2d");
var background = BACKGROUND.getContext("2d");

//Global game variables
var NumberOfPlayers;

//Controller variables
//
var touchable = 'createTouch' in document;
var touchX;
var touchY;
var touchFlag = false; //indicates something is touching

//Random variables that make the game work
//
var gameState = "menu";  //determines game state to switch between menus etc.
var bubbleCount = 0; //counts how many bubbles are on screen. If 0, new level.
var players = [];  //arrays to hold bubbles, players, spears
var bubbles = [];
var spears = [];
spears[0] = new Spear(); //player 1 spears
spears[1] = new Spear();
spears[2] = new Spear(); //players 2 spears
spears[3] = new Spear();

//Power up variables
//
var multipleSpears = false; //if you get the multiple spears powerup you can shoot two spears

//Configure constants that effect game behaviour
//
var GROUND = 225; //y coordinates of the start of the ground
var BIGBALL_HEIGHT = 8;  //define maximum height of ball bounces
var MEDBALL_HEIGHT = 7;
var SMALLBALL_HEIGHT = 6;
var TINYBALL_HEIGHT = 5;
var GRAVITY = 0.2;  //ball bounces at a faster rate based on this

//player attributes
var PLAYER_SPEED = 1.65;  
var PLAYER_HEIGHT = 30;
var PLAYER_WIDTH = 15;

//spear attributes
var SPEAR_SPEED = 5;
var SPEAR_HEIGHT = 5;
var SPEAR_WIDTH = 3;

//bubble attributes
var SPEEDX = 1.5;
var SPEEDY = 0.5;
var BUBBLEY = 40; //starting height of bubbles
var RADIUS = [];
RADIUS[4] = 25; //the radius of 'big' balls
RADIUS[3] = 18; //the radius of 'medium' balls
RADIUS[2] = 9;  //the radius of 'small' balls
RADIUS[1] = 5;  //the radius of 'tiny' balls
RADIUS[0] = 0;  //the ball disappears!





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
    var circleDistanceX = Math.abs(circle.x - (rect.x+(rect.width/2)));
    var circleDistanceY = Math.abs(circle.y - (rect.y+(rect.height/2)));

    if (circleDistanceX > (rect.width/2 + circle.radius)) { return false; }
    if (circleDistanceY > (rect.height/2 + circle.radius)) { return false; }

    if (circleDistanceX <= (rect.width/2)) { return true; } 
    if (circleDistanceY <= (rect.height/2)) { return true; }

    var cornerDistance_sq = (circleDistanceX - rect.width/2)^2 +
                         (circleDistanceY - rect.height/2)^2;

    if (cornerDistance_sq <= (circle.r^2)) { return true; }

}

function Menu() {
    this.update = function update() {
        
        if (Key.isDown(Key.SPACE) || Key.isDown(Key.ENTER)) {
            ctx.clearRect(0,0,SCREEN.width,SCREEN.height);
            
            if (menuPosition === 0) {
                NumberOfPlayers = 1;
            }
            else if (menuPosition === 1) {
                NumberOfPlayers = 2;
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
            gameState = "game";
        }
    };
    
    this.draw = function() {
        ctx.clearRect(0,0,SCREEN.width, SCREEN.height);
        if (gameState === "menu") {
            if (menuPosition === 0) {
                ctx.fillStyle = "red";
                ctx.fillRect(150,151,15,15);
            }
            else if (menuPosition === 1) {
                ctx.fillStyle = "red";
                ctx.fillRect(150,181,15,15);
            }
        
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.fillText("Gwai Los In Time",SCREEN.width/2,SCREEN.height/2);
            
            ctx.fillText("1 Player",SCREEN.width/2,SCREEN.height/2+50);
            ctx.fillText("2 Players",SCREEN.width/2,SCREEN.height/2+80);
        }
    };
}


//generates/controls/draws player at coordinate x
function Player(x, colour) {
    
    //initial values
    this.x = x;
    this.y = GROUND-PLAYER_HEIGHT;
        
    this.height = PLAYER_HEIGHT;
    this.width = PLAYER_WIDTH;
    
    this.colour = colour;

    this.update = function update() {
        playerCanvas.clearRect(this.x-4,this.y-4,this.width+8,this.height+8);
        
        movePlayer();

        
        if (touchFlag === true) {   ///What the touch controls do. This should be moved somewhere more logical
            if (touchY > 240) {
                if (touchX < 120) {
                    players[0].moveLeft();
                }
                else if (touchX > 120 && touchX < 240) {
                    players[0].moveRight();
                }
                else if (touchX > 240) {
                    spears[0].chuck(players[0].x + (PLAYER_WIDTH/2));
                }
            }
        }

    };
    
    this.draw = function draw() {
        playerCanvas.fillStyle = this.colour;
        playerCanvas.fillRect(this.x,this.y,players[0].width,players[0].height);
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

//generates a spear at coordinate x
function Spear() {
    this.alive = false;
    
    this.chuck = function chuck(x) {  //chucks spear at coordinate x
        this.alive = true;
        this.x = x;
    };
    
    this.update = function update() {
        ctx.clearRect(this.x-2, this.y-2, SPEAR_WIDTH+4, SPEAR_HEIGHT+4);
        //spear travels upwards
        this.y -= SPEAR_SPEED;
        this.height = GROUND-this.y;
        
        //hits top of screen and disappears
        if (this.y < 0) {
            this.init();
        }
    };
    
    //initializes a spear on contact with bubble or the edge of the screen
    this.init = function() {
        ctx.clearRect(this.x-2, this.y-2, SPEAR_WIDTH+4, SCREEN.height+4);
        this.alive = false;
        this.y = GROUND-SPEAR_HEIGHT;
        this.height = SPEAR_HEIGHT;
        this.width = SPEAR_WIDTH;
    };
    
    this.draw = function draw() {
        if (this.alive) {
            //rope
            ctx.fillStyle = "brown";
            ctx.fillRect(this.x, this.y,this.width,(GROUND-this.y));
    
            //spear head
            ctx.fillStyle = "silver";
            ctx.fillRect(this.x,this.y,this.width,SPEAR_HEIGHT);
        }
    };
}

//generates bubbles to be popped
function Bubble (x,y,radius,dx,dy) {

    //defines initial ball coordinates
    this.x = x;
    this.y = y;
    
    this.radius = radius;
    
    this.velocityX = dx;
    this.velocityY = dy;
    
    this.alive = true;

    
    this.update = function() {
        if (this.alive) {
            //Clear current image of bubble
            ctx.clearRect(this.x-this.radius-2,this.y-this.radius-2,this.radius*2+4,this.radius*2+4); 
            
            this.x += this.velocityX;
            this.y += this.velocityY;
            
            this.velocityY += GRAVITY;
            
            //limits height of bounce based on kind of bubble
            if (this.radius === RADIUS[4]) {
                if (this.velocityY > BIGBALL_HEIGHT) { 
                    this.velocityY = BIGBALL_HEIGHT;
                }
            }
            else if (this.radius === RADIUS[3]) {
                if (this.velocityY > MEDBALL_HEIGHT) { 
                    this.velocityY = MEDBALL_HEIGHT;
                }
            }
            else if (this.radius === RADIUS[2]) {
                if (this.velocityY > SMALLBALL_HEIGHT) { 
                    this.velocityY = SMALLBALL_HEIGHT;
                }
            }
            else if (this.radius === RADIUS[1]) {
                if (this.velocityY > TINYBALL_HEIGHT) { 
                    this.velocityY = TINYBALL_HEIGHT;
                }
            }
            
            //If bubble hits edges, reverse direction
            if (this.checkHitEdgeX(this.x - this.radius) === true || 
                this.checkHitEdgeX(this.x + this.radius) === true) {  
                this.velocityX *= -1;
            }
            if (this.checkHitEdgeY(this.y - this.radius) === true || 
                this.checkHitEdgeY(this.y + this.radius) === true) {  
                this.velocityY = (this.velocityY - GRAVITY) * -1; //prevent gravity from adding at the moment that the yVel changes direction
            }
            
            for (var i = 0; i < spears.length; i++) {
                if (spears[i].alive === true) {  //only kicks in if spear is alive
                    //split into smaller bubbles on contact with spear
                    if (collision(this, spears[i])) {
                        this.velocityX *= -1; //reverse direction of ball
                        this.velocityY = Math.abs(this.velocityY) * -1; //makes sure balls explode upwards, otherwise game is too hard
                        
                        if (this.radius === RADIUS[4]) {
                            this.radius = RADIUS[3];
                            this.split(i);
                            bubbleCount++;
                        }
                        else if (this.radius === RADIUS[3]) {
                            this.radius = RADIUS[2];
                            this.split(i);
                            bubbleCount++;
                        }
                        else if (this.radius === RADIUS[2]) {
                            this.radius = RADIUS[1];
                            this.split(i);
                            bubbleCount++;
                        }
                        else if (this.radius === RADIUS[1]) {
                            this.x = 0;
                            this.y = 0;
                            this.radius = 0;   //Get rid of ball.
                            this.alive = false;
                            bubbleCount -= 1;
                        }
                        
                        ctx.clearRect(spears[i].x-2, spears[i].y-2, SPEAR_WIDTH+4, SCREEN.height+4);
                        spears[0].init();
                    }
                }
            }
            
            if (collision(this,players[0])) {
                //alert("You got hit!");
            }
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
    
    //splits bubble in half around the spear specified
    this.split = function split(spear) {
        if (this.velocityX < 0) {
            this.x = spears[spear].x-this.radius-1;  //move ball outside of collision with spear
            bubbles.push(new Bubble(spears[spear].x+SPEAR_WIDTH+this.radius+1, 
                this.y, this.radius, this.velocityX*-1,this.velocityY)); 
        }
        else if (this.velocityX > 0) {
            this.x = spears[spear].x+SPEAR_WIDTH+this.radius+1;
            bubbles.push(new Bubble(spears[spear].x-this.radius-1, 
                this.y, this.radius, this.velocityX*-1, this.velocityY));
        }
    };

    
    //checks if ball hits edges of gameboard on y axis
    this.checkHitEdgeY = function checkHitY(y) {
        if (y <= 0 ) {
            return true;
        }
        else if (y >= GROUND) {
            this.y = GROUND-this.radius-1; //bug fix to make sure things don't get stuck in ground
            return true;
        }
        else {
            return false;
        }    
    };
    
    //cchecks if ball hit edges of gameboard on X axis
    this.checkHitEdgeX = function checkHitX(x) {
        if (x >= SCREEN.width ) {
            this.x = SCREEN.width-this.radius-1;
            return true;
        }
        else if (x < 0 ) {
            this.x = 0+this.radius+1;
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
  ENTER: 13,
  A: 65,
  D: 68,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
    if (gameState === "game") {
        if (event.keyCode == 32) {   //Player 1 shoots spear
            // Spacebar
            if (spears[0].alive === false) {
                spears[0].init();
                spears[0].chuck(players[0].x + (PLAYER_WIDTH/2));
            }
            else if (spears[1].alive === false && multipleSpears === true) {
                spears[1].init();
                spears[1].chuck(players[0].x + (PLAYER_WIDTH/2));
            }
        }
        
        if (event.keyCode == 83) {   //Player 2 shoots spear
            // 'S'
            if (spears[2].alive === false) {
                spears[2].init();
                spears[2].chuck(players[1].x + (PLAYER_WIDTH/2));
            }
            else if (spears[3].alive === false && multipleSpears === true) {
                spears[3].init();
                spears[3].chuck(players[1].x + (PLAYER_WIDTH/2));
            }
        }
    }
    
    if (gameState === "menu") {
        if (event.keyCode == 40 || event.keyCode == 39) {
            // Down Key + Right Key
            menuPosition += 1;
            
            if (menuPosition > 1) {
                menuPosition = 0;
            }
        }
        else if (event.keyCode == 38 || event.keyCode == 37) {
            // Up Key + Left Key
            menuPosition -= 1;
            
            if (menuPosition < 0) {
                menuPosition = 1;
            }            
        }
    }
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};


function movePlayer() {
    if (gameState === "game") {
        //Player 1 controls
        if (Key.isDown(Key.LEFT)) players[0].moveLeft();
        if (Key.isDown(Key.RIGHT)) players[0].moveRight();
        
        //Player 2 controls
        if (Key.isDown(Key.A)) players[1].moveLeft();
        if (Key.isDown(Key.D)) players[1].moveRight();
    }   
}

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
        case "menu":
            menu.update();
            menu.draw();
            break;
        
        case "game":
            
            if (bubbleCount === 0) {  //if no bubbles left, reset
                bubbles[0] = new Bubble(SCREEN.width/2,BUBBLEY, RADIUS[4], SPEEDX*-1, SPEEDY);
                bubbleCount = 1;
            }
                        
            for (var i = 0; i < NumberOfPlayers; i++) {
                players[i].update();
            }
            for (i = 0; i < spears.length; i++) {
                spears[i].update();
            }
            for (i = 0; i < bubbles.length; i++) {
                bubbles[i].update();
            }
            
            for (i = 0; i < bubbles.length; i++) {
                bubbles[i].draw();
            }
            
            for (i = 0; i < spears.length; i++) {
                spears[i].draw();
            }
            
            for (i = 0; i < NumberOfPlayers; i++) {
                players[i].draw();
            }

            break;
    }
    
    requestAnimFrame(function() {  //request new frame of animation
        main();
    });
}




//Initialize shit
players[0] = new Player(30, "blue");
players[1] = new Player(60, "red");

var menu = new Menu();


//Starts game
main();