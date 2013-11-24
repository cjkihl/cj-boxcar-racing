/**
 * A Game Level made from a tmx-level file
 * @author Carl-Johan Kihl
 * @since 2013-10-21
 * @namespace Game
 * @param {Number} width Level width
 * @param {Number} height Level height
 * @param {Image} Images 
 */
Game.Level = Class.create({
    
    /**
     * Level constructor
     * @param {Object} settings for this level
     */
    initialize: function(options) {
        'use strict';
        this.width = options.width || null;
        this.height = options.height || null;
        this.resources = {
            images: options.images || {},
            sounds: options.sounds || {}        
        };
        this.layers = [];
        this.backgrounds = [];
        this.renderedsprites = 0;
        
        //Create box2d world & gravity
        this.world = new Game.b2World(new Game.b2Vec2(0,Game.DEFAULT_GRAVITY),true);
        
        //Save the level score
        this.score = 0;
        
        //Create the contact listener for all contacts in the world
        var cl = new Game.b2ContactListener();
        cl.PostSolve = function(contact, impulse) {
            
            // Should the body break?
            var e1 = contact.GetFixtureA().GetBody().GetUserData(), e2 = contact.GetFixtureB().GetBody().GetUserData(),
                    count = contact.GetManifold().m_pointCount,maxImpulse,i;
            
            //If it's self-collision return
            if(e1 === e2) { return; }
            
            //If one of the bodies exists check the impulse of collison
            if (e1 !== null || e2 !== null) {
                
                //If player hits the exit
                if((e1!==null && e2!==null) && ((e1.type === 'exit' && e2.type==='vehicle') || (e2.type === 'exit' && e1.type==='vehicle'))) {
                        game.gameSuccess();
                }

                maxImpulse = 0;
                for (i = 0; i < count; i++) {
                    maxImpulse = Game.b2Math.Max(maxImpulse, impulse.normalImpulses[i]); }

                    //Don't take damage of small impulses
                    if(maxImpulse < 1.8) { return; }

                    if(e1 !==null && e1.entity !==null && e1.entity.breakable === true) 
                    {e1.entity.damage -= maxImpulse;}
                    if(e2 !==null && e2.entity !==null && e2.entity.breakable === true) 
                    {e2.entity.damage -= maxImpulse;}
            }
        };
        this.world.SetContactListener(cl);
    },
    /**
     * Loads all resources for the level, will be called after the level is initializes
     * The level should not be started before the all resources are loaded
     * @param {Object} onComplete callback when loading is complete 
     */    
    loadResources: function(onComplete) {
        'use strict';
        var imagesToLoad = this.resources.images, loadCount = 0,k,img,
                onload = function(){
                    loadCount--;
                    console.log(loadCount + " images left to load");
                    if(loadCount <= 0) {
                        console.log("All images are loaded");
                        if(typeof onComplete === 'function') { onComplete(); }
                    }},
                onerror = function() {
                    console.log("image load error");
                };
        
        this.resources.images = {};
        console.log(imagesToLoad);
        
        //Count images to load
        for(k in imagesToLoad) {
            if(imagesToLoad.hasOwnProperty(k)) {
                loadCount++;
            }
        }
        
        //Load all the images
        for(k in imagesToLoad) {
            if(imagesToLoad.hasOwnProperty(k)) {
                console.log(k);
                img = new Image();
                img.id = k;
                img.onload = onload;
                img.onerror = onerror;
                img.src = imagesToLoad[k];
                this.resources.images[k] = img;
            }
        }
    },    
        
    /**
    * Renders a level
    * @param {Context2D} ct 2D context for Canvas
    * @param {Game.Camera} camera 2d Camera
    */
    render: function(ct) {
        'use strict';
        var bg,im,i,width,height,w,x,j,s;
        ct.clearRect(0,0,this.width,this.height);
        this.renderedSprites = 0;

        //Render background
        for(i=0; i<this.backgrounds.length;i++) {
            bg = this.backgrounds[i];
            im = this.resources.images[bg.image]; 
            width = (im.width * bg.scaleX);
            height = (im.height * bg.scaleY);

            //Parallax rendering and background repeating
            for(w=0; w < (this.camera.width + width); w += width) {
                x = ~~((this.camera.x * bg.pX) % width);    
                ct.drawImage(this.resources.images[bg.image],x + w,0,width,height);
                if(bg.repeatX === false) { break; }
            }
        }

        //Render all entities
        ct.save();
        ct.translate(-this.camera.x,-this.camera.y);
        for(i=0; i<this.layers.length;i++) {
            for(j=0; j < this.layers[i].entities.length;j++) {
                s = this.layers[i].entities[j];
                
                //Check if the sprite is going to be removed
                if(s.removed===true) {
                    this.layers[i].entities.splice(j,1);
                    j--;
                }

                s.render(ct,this);
                this.renderedSprites++;
            }
        }

        ct.restore();
        
        //Render Levelscore
        ct.font = "48px Arial";
        ct.fillText(~~this.score,100,100);
    },
    
    update: function(dt) {
        'use strict';
        //Box2d world supports only fixed timestep.
        this.world.Step(1/30, 10, 10);
        this.world.ClearForces();
        this.camera.update(dt);
    },
    /**
     * Renders the debug-drawings
     */    
    debugRender: function(ct) {
        'use strict';
        ct.clearRect(0, 0, this.camera.width, this.camera.height);
        
        //If no debugdrawer i created yet, create one
        if(this.b2DebugDraw === undefined) {
            
            //Create box2d debug-drawer
            this.b2DebugDraw = new Game.b2DebugDraw();
            this.b2DebugDraw.SetSprite(ct);
            this.b2DebugDraw.SetDrawScale(Game.BOX2D_SCALE);
            this.b2DebugDraw.SetFillAlpha(0.6);
            this.b2DebugDraw.SetLineThickness(1.0);
            this.b2DebugDraw.SetFlags(Game.b2DebugDraw.e_shapeBit | Game.b2DebugDraw.e_jointBit);
            this.world.SetDebugDraw(this.b2DebugDraw); 
        }

        ct.save();
        ct.translate(-this.camera.x,-this.camera.y);
        this.world.DrawDebugData();
        ct.restore();
    }
});