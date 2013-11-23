/**
 * A 2D Camera that follows a target
 * @author Carl-Johan Kihl
 * @since 2013-10-24
 * @namespace Game
 * @param {Number} w Viewport width
 * @param {Number} h ViewPort height
 * @param {Game.Level} level The level the camera will be placed in
 */
Game.Camera = Class.create({
    deadzone: {x:0,y:0,width:0,height:0},
    limit: {x:0,y:0,width:0,height:0},
    target:null,
    followAxis: Game.AXIS.BOTH,
    
    initialize: function(w,h,level) {
        'use strict';
        this.x = 0;
        this.y = level.height - h;
        this.width = w;
        this.height = h;
        this.limit.width = level.width - w;
        this.limit.height = level.height - h;
        
        //Default deadzone
        this.setDeadzone(300,200,300,400);
    },
    move: function(x,y) {
        'use strict';
        var newX = this.x + x, newY = this.y + y;
        this.x = ~~newX.clamp(this.limitX,this.limitWidth);
        this.y = ~~newY.clamp(this.limitY,this.limitHeight);
    },
    update: function(dt) {
        'use strict';
        if(this.target!==null) {
            switch(this.followAxis) {
                case Game.AXIS.VERTICAL:
                    this._followV(this.target); break;
                case Game.AXIS.HORIZONTAL:
                    this._followH(this.target); break;
                case Game.AXIS.BOTH:
                    this._followV(this.target);
                    this._followH(this.target); break;
            }
        } 
    },
    /**
    * Change the deadzone settings
    * @name setDeadzone
    * @param {Number} w deadzone width
    * @param {Number} h deadzone height
    */
   setDeadzone : function(top,bottom,left, right) {
       'use strict';
        this.deadzone.x = ~~((this.width - left) / 2);
        this.deadzone.y = ~~((this.height - top) / 2 - this.height * 0.25);
        this.deadzone.width = this.width - right;
        this.deadzone.height = this.height - bottom;

   },
    /** @ignore */
    _followH : function(target) {
        'use strict';
        if ((target.x - this.x) > (this.deadzone.width)) {
                this.x = ~~Math.min((target.x) - (this.deadzone.width), this.limit.width);
        }
        else if ((target.x - this.x) < (this.deadzone.x)) {
                this.x = ~~Math.max((target.x) - this.deadzone.x, 0);
        }                
    },

    /** @ignore */
    _followV : function(target) {
        'use strict';
        if ((target.y - this.y) > (this.deadzone.height)) {
                this.y = ~~Math.min((target.y) - (this.deadzone.height),this.limit.height);
        }
        else if ((target.y - this.y) < (this.deadzone.y)) {
                this.y = ~~Math.max((target.y) - this.deadzone.y, -200);
        }   
    }
});
