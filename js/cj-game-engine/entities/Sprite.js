/**
 * A Sprite entity, the standard way to define a image on a 2D-plane
 * @author Carl-Johan Kihl
 * @since 2013-10-21
 * @namespace Game
 */
Game.Sprite = Class.create({
    initialize: function(o,level) {
        'use strict';
        this.x = o.x || 0;
        this.y = o.y || 0;
        this.width = o.width || 0;
        this.height = o.height || 0;
        this.image = o.image || null;
        this.sourceX = o.sourceX || 0;
        this.sourceY = o.sourceY || 0;
        this.sourceWidth = o.sourceWidth || 0;
        this.sourceHeight = o.sourceHeight || 0;
        this.removed = false;
        this.level = level;
    },
    /**
    * Renders a sprite
    * @param {Context2D} ct
    */    
    render: function(ct) {
        'use strict';
        ct.drawImage(this.level.resources.images[this.image],
        this.sourceX,this.sourceY,
        this.sourceWidth,this.sourceHeight,
        this.x,this.y,
        this.width,this.height);
    }    
});