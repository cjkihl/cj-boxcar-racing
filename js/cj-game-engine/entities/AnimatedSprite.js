/**
 * A sprite thats split an image into segments and makes an animation
 * @author Carl-Johan Kihl
 * @since 2013-11-10
 * @namespace Game
 */
Game.AnimatedSprite = Class.create({
    initialize: function(o,level) {
        'use strict';
        this.x = o.x || 0;
        this.y = o.y || 0;
        this.width = o.width || 0;
        this.height = o.height || 0;
        
        //Number of segments on the x-axis
        this.sx = o.sx || 1;
        
        //Number of segments on the y-axis
        this.sy = o.sy || 1;
        
        //The frame-speed compared to the normal one
        this.animationSpeed = o.animationSpeed || 1;
        
        //True the sprite will loop, else if will remove itself
        this.loop = o.loop;
        if(this.loop===undefined) { this.loop = true; }
        
        this.sourceX = 0;
        this.sourceY = 0;
        this.image = o.image || null;
        this.sourceWidth = 0;
        this.sourceHeight = 0;
        this.currentFrame = 0;
        this.removed = false;
        this.level = level;
    },
    /**
     * Renders the animated sprite
     * @param  {Object} ct the Canvas 2d Context
     */
    render: function(ct) {
        'use strict';
        var img = this.level.resources.images[this.image],frame = ~~this.currentFrame;
        img.width = 1536;
        img.height = 1279;
        
        //If source with is not set
        if(this.sourceWidth===0){
            this.sourceWidth = ~~(img.width / this.sx);
            this.sourceHeight = ~~(img.height / this.sy);
        }
        
        this.sourceX = frame % this.sx;
        this.sourceY = ~~((frame - this.sourceX) / this.sx);
        ct.drawImage(img,
        this.sourceX * this.sourceWidth ,this.sourceY * this.sourceHeight,
        this.sourceWidth,this.sourceHeight,
        this.x - this.width / 2,this.y - this.height/2,
        this.width,this.height);
        this.currentFrame += this.animationSpeed;
        
        //At animation end
        if(this.currentFrame >= this.sx * this.sy) {
            if(this.loop===false) {  this.removed = true; } 
            this.currentFrame = 0;
        }
     }    
});