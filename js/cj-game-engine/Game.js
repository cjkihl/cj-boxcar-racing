/**
 * The namespace and constants of the game-engine
 * @author Carl-Johan Kihl
 * @since 2013-10-21
 * @namespace Game
 */
var Game = {
    
    AXIS :{NONE: 0, HORIZONTAL: 1, VERTICAL: 2, BOTH: 3},
    GAMESTATE : { MENU: 0, RUNNING:1, PAUSED:2, GAMEOVER:3},        
    CAMERA_SPEED:1, 
    DEFAULT_GRAVITY: 7,
    BOX2D_SCALE: 25,
    
    //Make Box2D available in Game Namespace
    b2Vec2: Box2D.Common.Math.b2Vec2,
    b2Math: Box2D.Common.Math.b2Math,
    b2AABB: Box2D.Collision.b2AABB,
    b2BodyDef: Box2D.Dynamics.b2BodyDef,
    b2Body: Box2D.Dynamics.b2Body,
    b2FixtureDef: Box2D.Dynamics.b2FixtureDef,
    b2Fixture: Box2D.Dynamics.b2Fixture,
    b2World: Box2D.Dynamics.b2World,
    b2MassData: Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw: Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef:  Box2D.Dynamics.Joints.b2MouseJointDef,
    b2PrismaticJointDef: Box2D.Dynamics.Joints.b2PrismaticJointDef,
    b2RevoluteJointDef: Box2D.Dynamics.Joints.b2RevoluteJointDef,
    b2ContactListener: Box2D.Dynamics.b2ContactListener,
    
    //Some default images that is loaded
    IMG_SMOKE: 'smoke1_30'

};

/**
 * The main game module
 * @author Carl-Johan Kihl
 * @since 2013-10-20
 * @namespace Game
 */
Game.Game2D = Class.create({
    
    /**
    * Screens for the scenemanager
    */
    screens: {
        introScreen: function(gui) {
           'use strict';
           var title = document.createElement('h2'),     
           text = document.createElement('p'),
           click = function() { game.screenManager.setScreen(game.screens.menuScreen);};        
           title.innerHTML = "Box-Car Racer";
           text.innerHTML = "Click to start!";
           title.onclick = click;
           text.onclick = click;
           gui.appendChild(title);
           gui.appendChild(text);
        },
        menuScreen: function(gui) {
           'use strict';
           var title = document.createElement('h2'),
           newGame = document.createElement('p'),       
           about = document.createElement('p');
           title.innerHTML = 'Box-Car Racer';
           newGame.innerHTML = 'New Game';
           about.innerHTML = 'About this game';
           newGame.onclick = function() {game.screenManager.setScreen(game.screens.levelScreen);};
           about.onclick = function() {game.screenManager.setScreen(game.screens.aboutScreen);};
           gui.appendChild(title);
           gui.appendChild(newGame);
           gui.appendChild(about);
        },
        levelScreen: function(gui) {
           'use strict';
           var title = document.createElement('h2'),
           ul = document.createElement('ul');
           title.innerHTML = 'Select Level';
           //Create list with all levels
           game.levels.each(function(level) {
               
               var e = document.createElement('li');
               e.innerHTML = level.title;
               e.onclick = function() { game.loadLevel(level.name);};
               ul.appendChild(e);
           });
           
           gui.appendChild(title);
           gui.appendChild(ul);
        },
        inGameScreen: function(gui) {
           'use strict';
           var title = document.createElement('h2'),
           resumeGame = document.createElement('p'),
           exit = document.createElement('p');
           title.innerHTML = 'Paused';
           resumeGame.innerHTML = 'Resume Game';
           exit.innerHTML = 'Exit to Menu';
           resumeGame.onclick = game.resumeGame;
           exit.onclick = game.exitGame;
           gui.appendChild(title);
           gui.appendChild(resumeGame);
           gui.appendChild(exit);
        },
        gameOverScreen: function(gui) {
           'use strict';
           var title = document.createElement('h2'),
           restartGame = document.createElement('p'),
           exit = document.createElement('p');
           title.innerHTML = 'Game Over!';
           restartGame.innerHTML = 'Restart Level';
           exit.innerHTML = 'Exit to Menu';
           restartGame.onclick = game.restartGame;
           exit.onclick = game.exitGame;
           gui.appendChild(title);
           gui.appendChild(restartGame);
           gui.appendChild(exit);
        },
        gameSuccessScreen: function(gui) {
           'use strict';
           var title = document.createElement('h2'),
           restartGame = document.createElement('p'),
           exit = document.createElement('p');
           title.innerHTML = 'You won the level! <br> Score: ' + game.currentLevel.score;
           restartGame.innerHTML = 'Restart Level';
           exit.innerHTML = 'Exit to Menu';
           restartGame.onclick = game.restartGame;
           exit.onclick = game.exitGame;
           gui.appendChild(title);
           gui.appendChild(restartGame);
           gui.appendChild(exit);
        },
        aboutScreen: function(gui) {
           'use strict';
           var title = document.createElement('h2'),
           about = document.createElement('span'),
           back = document.createElement('p');
   
           title.innerHTML = "About this game";
           about.innerHTML = 'Box-Car Racer is a 2D Game & Game-engine with <br> Javscript, HTML5, TMX-maps & Box2D-physics <br> created by <br> Carl-Johan Kihl 2013';
           back.innerHTML = 'Back';
           back.onclick = function() { game.screenManager.setScreen(game.screens.menuScreen); };
           gui.appendChild(title);
           gui.appendChild(about);
           gui.appendChild(back);
        }
    },
    /**
     * Initialises the game
     * @param {Object} options
     */
    initialize: function(options) {
        'use strict';
        //Canvas and screens
        
        
        this.canvas = options.canvas;
        this.ct = options.canvas.getContext('2d');
        
        this.gui = options.gui;
        this.debug_ct = options.debug_canvas.getContext('2d');
        
        //Url to all levels
        this.resourceUrl = options.resourceUrl || null;
        this.levels = options.levels || null;
        
        //Events
        this.events = options.events || {};

        //All start-options
        this.startOptions = options;
        
        this.gamestate = Game.GAMESTATE.MENU;
        
        //Load screenmanager
        this.screenManager = new Game.ScreenManager({
            gui:this.gui,
            levels:this.levels
        });
        
        window.addEventListener('keypress', function (event) {
            if(event.which === 112 || event.charCode ===112) {
                if(Game.GAMESTATE.RUNNING === game.gamestate) {
                    game.pauseGame();
                    
                }   else if (Game.GAMESTATE.PAUSED === game.gamestate) {
                    game.resumeGame(); 
                }
            }
        },false);

        //Show startmenu
        this.screenManager.setScreen(this.screens.introScreen).show();
    },
    
    /**
     * Loads a level by name
     * @param {String} levelName the name of the level
     */
    loadLevel: function(levelName) {
       'use strict';
        //Load the level with the TMX Json reader
        Game.TMXJsonReader.loadAsync(this.resourceUrl +'/levels/'+levelName+'.json', {
            
            onSuccess: function(level) {
                level.name = levelName;
                level.resources.images[Game.IMG_SMOKE] = game.resourceUrl + '/images/smoke1_30.png';
                console.log("Level created, Loading resources..");
                level.loadResources(function () {
                    
                    game.screenManager.hide();
                    
                    //Fire onloaded event
                    if(game.events.onLoaded !== undefined) { game.events.onLoaded(); }

                    //Set current level
                    game.currentLevel = level;

                    //Start game
                    game.resumeGame();
                });
            },   
            onProgress: function(progress,message) {
                console.log('Loading: ' + progress + " ## Message: " + message);
            }    
        });
    },
    
    /**
     * Main gameLoop, because this function will not be a part of the
     * game object after it is passed to requestAnimFrame, we refer to the global
     * game-object instead of this.
     */
    gameLoop: function() {
        'use strict';
        var now = Date.now(),
        dt = (now - (game.lastGameTick || now));
        game.lastGameTick = now;
        
        game.ct.clearRect(0, 0, game.canvas.width, game.canvas.height);

        if (game.events.onUpdate !== undefined) { game.events.onUpdate(); }
                
        if(game.currentLevel!==null) {
           game.currentLevel.update(dt); 
           game.currentLevel.render(game.ct, game.camera);
           if(game.currentLevel.debug) {
                game.currentLevel.debugRender(game.debug_ct,game.camera); }
        }
        
        if(game.gamestate === Game.GAMESTATE.RUNNING)  {
            //Because Box2D need a fixed timestep we use timout
            //instead for requestAnimationFrame
            window.setTimeout(game.gameLoop, 1000 / 60);
            //requestAnimFrame(game.gameLoop);
        } else {
            console.log("game stopped");
        }
    },  
    pauseGame: function() {
        'use strict';
        game.gamestate = Game.GAMESTATE.PAUSED;
        this.screenManager.setScreen(game.screens.inGameScreen).show();
    },
    resumeGame: function() {
        'use strict';
        //It's not possible to resume game if game is over
        if(game.gamestate === Game.GAMESTATE.GAMEOVER) {
            return;
        }
        game.gamestate = Game.GAMESTATE.RUNNING;
        game.screenManager.hide();
        game.gameLoop();
    },
    gameOver: function () {
        'use strict';
        game.gamestate = Game.GAMESTATE.GAMEOVER;
        this.screenManager.setScreen(game.screens.gameOverScreen).show();
    },
    gameSuccess: function () {
        'use strict';
        game.gamestate = Game.GAMESTATE.GAMEOVER;
        this.screenManager.setScreen(game.screens.gameSuccessScreen).show();
    },
    restartGame: function() {
        'use strict';
        game.gamestate = Game.GAMESTATE.MENU;
        game.loadLevel(game.currentLevel.name);
    },
    exitGame: function() {
        'use strict';
        game.currentLevel = null;
        game.gamestate = Game.GAMESTATE.MENU;
        game.screenManager.setScreen(game.screens.menuScreen).show();
    }
});

window.requestAnimFrame = (function() {
    'use strict';
    
    return  (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            });
})();

window.cancelRequestAnimFrame = (function() {
    'use strict';
    return  window.cancelRequestAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            window.clearTimeout;
})();

window.Key = {
    pressed: {},
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,
    A: 65,
    S: 83,
    D: 68,
    W: 87,
    ENTER:13,
    ESCAPE:27,
    P:80,
    R:82,
    isDown: function(keyCode, keyCode1) {
        'use strict';
        return this.pressed[keyCode] || this.pressed[keyCode1];
    },
    onKeydown: function(event) {
        'use strict';
        this.pressed[event.keyCode] = true;
    },
    onKeyup: function(event) {
        'use strict';
        delete this.pressed[event.keyCode];
    }
};
window.addEventListener('keyup', function(event) {
    'use strict';
    window.Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function(event) {
    'use strict';
    
    //Stop spacebar to work as pagedown
    if(event.keyCode===32) {
        event.preventDefault();
    }
    window.Key.onKeydown(event);
}, true);

/**
 * Fix to set a timeout with a callback-function where you can pass parameters
 * @param {Function} vCallback
 * @param {Number} nDelay
 * @returns {Number}
 */
Game.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  'use strict';
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return window.setInterval(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};

/**
 * Returns a number whose value is limited to the given range.
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
    'use strict';
    return Math.min(Math.max(this, min), max);
};