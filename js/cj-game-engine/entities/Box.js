/**
 * An Box with box2d physics
 * @author Carl-Johan Kihl
 * @since 2013-10-21
 * @namespace Game
 */
Game.Box = Class.create({
    initialize: function(sprite,o,level) {
        'use strict';
        this.sprite = sprite;
        this.bonus = parseInt(o.bonus,10) || 100;
        this.damage = o.damage || 100;
        this.breakable = o.breakable || true;
        this.level = level;
        this.removed = false;
        
        //Create Box2D
        var fixDef = new Game.b2FixtureDef(), bodyDef = new Game.b2BodyDef();

        bodyDef.position.Set((this.sprite.x + this.sprite.width / 2) / Game.BOX2D_SCALE, this.sprite.y / Game.BOX2D_SCALE);
        bodyDef.type = Game.b2Body.b2_dynamicBody;
        fixDef.density = 0.1;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.5;
        fixDef.shape = new Game.b2PolygonShape(1);
        fixDef.shape.SetAsBox(sprite.width / Game.BOX2D_SCALE / 2, sprite.height / Game.BOX2D_SCALE / 2);
        bodyDef.userData = {type:"box", entity:this};
        
        this.body = level.world.CreateBody(bodyDef);
        this.body.CreateFixture(fixDef);
        this.body.SetFixedRotation(false);
        this.sprite.x = - this.sprite.width / 2;
        this.sprite.y = - this.sprite.height / 2;
    },
    /**
     * Renders this box
     * @param {Object} ct Canvas 2d Context
     */
    render: function(ct) {
        'use strict';
        if(this.damage <= 0) {
           this.level.world.DestroyBody(this.body);
           this.removed = true;
           
           //Create smoke-animation sprite
           this.level.layers[0].entities.push(new Game.AnimatedSprite({
               x:this.position.x * Game.BOX2D_SCALE,
               y:this.position.y * Game.BOX2D_SCALE,
               width: 200,
               height: 200,
               image: Game.IMG_SMOKE,
               sx: 6,
               sy: 5,
               loop:false
           },this.level));
           
           //Add the bonus to the score
           game.currentLevel.score += this.bonus;
        } 
        else {
            this.position = this.body.GetWorldCenter();
        
            ct.save();
            ct.translate(this.position.x * Game.BOX2D_SCALE,
                this.position.y * Game.BOX2D_SCALE);
            ct.rotate(this.body.GetAngle());

            this.sprite.render(ct);
            ct.font = "24px Arial";
            ct.fillStyle = "blue";
            ct.fillText(~~this.damage,-25,0);
            ct.restore();
        }
    }    
});

