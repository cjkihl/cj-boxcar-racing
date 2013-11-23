/**
 * The player vehicle for the game, can be controlled by the keyboard
 * @author Carl-Johan Kihl
 * @since 2013-10-21
 * @namespace Game
 */
Game.Vehicle = Class.create({
    
    //The settings for the vehicle
    options: null,
    
    //Player can only rotate again after a small delay
    canRotate: true,
    cart: null,
    spring1: null,
    spring2: null,
    motor1: null,
    motor2: null,
    WHEEL_IMAGE: 'vehicle_wheel',
    BODY_IMAGE: 'vehicle_body',
    
    /**
     * Constructor
     * @param {Object} The settings for the vehicle
     * @param {Object} The level the vehicle will be created in
     */
    initialize: function(o, level) {
        'use strict';
        o.x = o.x || 4;
        o.y = o.y || 15;
        o.width = o.width || 3.4 * Game.BOX2D_SCALE;
        o.height = o.height || 0.6 * Game.BOX2D_SCALE;
        o.axle_x = o.axle_x || 1.3;
        o.axle2_x = o.axle2_x || 1.6;
        o.axle_y = o.axle_y || 0.3;
        o.axle_height = o.axle_height || 0.3;
        o.axle_width = o.axle_width || 0.15;
        o.wheel_radius = o.wheel_radius || 0.9;
        o.cart_img_width = 1.8 * 50;
        o.cart_img_height = 0.7  * 50;
        
        this.options = o;
        this.level = level;
        
        //Set images to level resources
        level.resources.images[this.WHEEL_IMAGE] = 'resources/images/vehicle/wheel_1.png';
        level.resources.images[this.BODY_IMAGE] = 'resources/images/vehicle/truck_1.png';
        
        //Start creating the Box2d Fixtures and bodies
        var     bodyDef = new Game.b2BodyDef(), 
                boxDef = new Game.b2FixtureDef(), 
                circleDef  = new Game.b2FixtureDef(), 
                prismaticJointDef  = new Game.b2PrismaticJointDef(),
                revoluteJointDef = new Game.b2RevoluteJointDef(),
                axle1, axle2, userData = {type:"vehicle", entity:this},i;

        bodyDef.type = Game.b2Body.b2_dynamicBody;
        bodyDef.position.Set(o.x / Game.BOX2D_SCALE, o.y / Game.BOX2D_SCALE);
        this.cart =level.world.CreateBody(bodyDef);
        
        boxDef.density = 0.5;
        boxDef.friction = 0.5;
        boxDef.restitution = 0.2;
        boxDef.filter.groupIndex = -1;
        boxDef.shape = new Game.b2PolygonShape();
        boxDef.shape.SetAsArray([new Game.b2Vec2(-0.5, -0.6),new Game.b2Vec2(-0.5, -1.4),new Game.b2Vec2(1.2, -1.4),new Game.b2Vec2(1.2, -0.6)],4);
        this.cart.CreateFixture(boxDef);
        boxDef.shape.SetAsBox(o.width / Game.BOX2D_SCALE, o.height / Game.BOX2D_SCALE);
        this.cart.CreateFixture(boxDef);
        this.cart.SetUserData(userData);
        boxDef.shape = new Game.b2PolygonShape();
        boxDef.shape.SetAsOrientedBox(o.axle_height, o.axle_width, new Game.b2Vec2(-o.axle_x, o.axle_y), -Math.PI / 3);
        this.cart.CreateFixture(boxDef);
        boxDef.shape.SetAsOrientedBox(o.axle_height, o.axle_width, new Game.b2Vec2(o.axle2_x, o.axle_y), Math.PI / 3);
        this.cart.CreateFixture(boxDef);
        this.cart.SetAngularDamping(20);
        
        // add the axles //
        boxDef.density = 1;
        axle1 = level.world.CreateBody(bodyDef);
        boxDef.shape.SetAsOrientedBox(o.axle_height, 0.1, new Game.b2Vec2(-o.axle_x - Math.cos(Math.PI / 3), o.axle_y + Math.sin(Math.PI / 3)), -Math.PI / 3);
        axle1.CreateFixture(boxDef);
        prismaticJointDef.lowerTranslation = -0.3;
        prismaticJointDef.upperTranslation = 0.5;
        prismaticJointDef.enableLimit = true;
        prismaticJointDef.enableMotor = true;

        prismaticJointDef.Initialize(this.cart, axle1, axle1.GetWorldCenter(), new Game.b2Vec2(-Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)));
        this.spring1 = level.world.CreateJoint(prismaticJointDef);
        axle2 = level.world.CreateBody(bodyDef);
        boxDef.shape.SetAsOrientedBox(o.axle_height, 0.1, new Game.b2Vec2(o.axle2_x + Math.cos(Math.PI / 3), o.axle_y + Math.sin(Math.PI / 3)), Math.PI / 3);
        axle2.CreateFixture(boxDef);
        prismaticJointDef.Initialize(this.cart, axle2, axle2.GetWorldCenter(), new Game.b2Vec2(Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)));
        this.spring2 = level.world.CreateJoint(prismaticJointDef);

        // add wheels //
        circleDef.density = 0.1;
        circleDef.friction = 5;
        circleDef.restitution = 0.2;
        circleDef.filter.groupIndex = -1;
        circleDef.shape = new Game.b2CircleShape(o.wheel_radius);

        for (i = 0; i < 2; i++) {
            bodyDef = new Game.b2BodyDef();
            bodyDef.type = Game.b2Body.b2_dynamicBody;
            if (i === 0) {
                bodyDef.position.Set(axle1.GetWorldCenter().x - o.axle_height * Math.cos(Math.PI / 3), axle1.GetWorldCenter().y + o.axle_height * Math.sin(Math.PI / 3)); }
            else {
                bodyDef.position.Set(axle2.GetWorldCenter().x + o.axle_height * Math.cos(-Math.PI / 3), axle2.GetWorldCenter().y + o.axle_height * Math.sin(Math.PI / 3)); }
            
            bodyDef.allowSleep = false;

            if (i === 0) {
                this.wheel1 = level.world.CreateBody(bodyDef);
                this.wheel1.SetUserData(userData);
            } else {
                this.wheel2 = level.world.CreateBody(bodyDef);
                this.wheel2.SetUserData(userData);
            }
                

            (i === 0 ? this.wheel1 : this.wheel2).CreateFixture(circleDef);
        }

        // add joints //
        revoluteJointDef.enableMotor = true;

        revoluteJointDef.Initialize(axle1, this.wheel1, this.wheel1.GetWorldCenter());
        this.motor1 = level.world.CreateJoint(revoluteJointDef);
        this.motor1.EnableMotor(true);
        revoluteJointDef.Initialize(axle2, this.wheel2, this.wheel2.GetWorldCenter());
        this.motor2 = level.world.CreateJoint(revoluteJointDef);
        this.motor2.EnableMotor(true);
    },
    /**
     * Renders the vehicle
     * @param {Context2D} ct
     */
    render: function(ct) {
        'use strict';
        this.update();
        
        //Draw cart fixtures
        var fixture = this.cart.GetFixtureList(), wr = this.options.wheel_radius * Game.BOX2D_SCALE;
        ct.strokeStyle = "#000";
        ct.lineWidth = 3;
        ct.fillStyle = "#AAA";
        
        //Draw upper axes
        ct.beginPath();
        this.drawFixture(ct,fixture);
        fixture = fixture.GetNext();
        this.drawFixture(ct,fixture);
        ct.closePath();
        ct.stroke();
        ct.fill();
        
        //Draw car
        this.tempVec = this.cart.GetWorldCenter();
        ct.save();
        ct.translate(this.tempVec.x * Game.BOX2D_SCALE,this.tempVec.y * Game.BOX2D_SCALE);
        ct.rotate(this.cart.GetAngle());
        ct.drawImage(this.level.resources.images[this.BODY_IMAGE],
        -this.options.cart_img_width,-this.options.cart_img_height,this.options.cart_img_width*2,this.options.cart_img_height*2);
        ct.restore();   
        
        //Wheel 1
        this.tempVec = this.wheel1.GetWorldCenter();
        ct.save();
        ct.translate(this.tempVec.x * Game.BOX2D_SCALE,this.tempVec.y * Game.BOX2D_SCALE);
        ct.rotate(this.wheel1.GetAngle());
        ct.drawImage(this.level.resources.images[this.WHEEL_IMAGE],-wr,-wr,wr*2,wr*2);
        ct.restore();
        //Wheel2
        this.tempVec = this.wheel2.GetWorldCenter();
        ct.save();
        ct.translate(this.tempVec.x * Game.BOX2D_SCALE,this.tempVec.y * Game.BOX2D_SCALE);
        ct.rotate(this.wheel2.GetAngle());
        ct.drawImage(this.level.resources.images[this.WHEEL_IMAGE],-wr,-wr,wr*2,wr*2);
        ct.restore();
    },
    tempVec: new Game.b2Vec2(),
    tempVec2: new Game.b2Vec2(),
    
    /**
     * Draws a polygon from a fixture
     */
    drawFixture: function(ct,fixture) {
        'use strict';
        var shape = fixture.GetShape(),
        vert = shape.GetVertices(),i;

        this.tempVec2 = this.cart.GetWorldPoint(vert[0]);
        ct.moveTo(this.tempVec2.x * Game.BOX2D_SCALE, this.tempVec2.y * Game.BOX2D_SCALE);
        
        for(i=1; i< vert.length;i++){
            this.tempVec = this.cart.GetWorldPoint(vert[i]);
            ct.lineTo(this.tempVec.x * Game.BOX2D_SCALE, this.tempVec.y * Game.BOX2D_SCALE);
        }
        ct.lineTo(this.tempVec2.x * Game.BOX2D_SCALE, this.tempVec2.y * Game.BOX2D_SCALE);
    },
    update: function() {
        'use strict';
        //If the player is outside the screen the game is over
        if(this.tempVec.y * Game.BOX2D_SCALE > this.level.height + 300) {
            game.gameOver();
        }
        this.tempVec = this.cart.GetPosition();
        this.x = this.tempVec.x * Game.BOX2D_SCALE;
        this.y = this.tempVec.y * Game.BOX2D_SCALE;
        
        this.motor1.SetMotorSpeed(15 * Math.PI * (Key.isDown(Key.W) ? 1 : Key.isDown(Key.S) ? -1 : 0));
        this.motor1.SetMaxMotorTorque(Key.isDown(Key.W) || Key.isDown(Key.S) ? 17 : 0.5);

        this.motor2.SetMotorSpeed(15 * Math.PI * (Key.isDown(Key.W) ? 1 : Key.isDown(Key.S) ? -1 : 0));
        this.motor2.SetMaxMotorTorque(Key.isDown(Key.W) || Key.isDown(Key.S) ? 12 : 0.5);

        this.spring1.SetMaxMotorForce(30 + Math.abs(800 * Math.pow(this.spring1.GetJointTranslation(), 2)));
        this.spring1.SetMotorSpeed((this.spring1.GetMotorSpeed() - 10 * this.spring1.GetJointTranslation()) * 0.4);

        this.spring2.SetMaxMotorForce(20 + Math.abs(800 * Math.pow(this.spring2.GetJointTranslation(), 2)));
        this.spring2.SetMotorSpeed(-4 * Math.pow(this.spring2.GetJointTranslation(), 1));

        if (window.Key.isDown(Key.SPACE)) {
            this.spring1.SetMaxMotorForce(200);
            this.spring1.SetMotorSpeed(20);
            this.spring2.SetMaxMotorForce(200);
            this.spring2.SetMotorSpeed(20);
        }

        var onRotationReady = this.onRotationReady;
        if (window.Key.isDown(Key.A)) {
            if (this.canRotate) {
                this.spring1.SetMaxMotorForce(100);
                this.spring1.SetMotorSpeed(10);
                this.cart.SetAngularVelocity(5);
                this.canRotate = false;
                Game.setTimeout(onRotationReady, 500, this);
            }
        }
        if (window.Key.isDown(Key.D)) {
            if (this.canRotate) {
                this.spring2.SetMaxMotorForce(100);
                this.spring2.SetMotorSpeed(10);
                this.cart.SetAngularVelocity(-5);
                this.canRotate = false;
                Game.setTimeout(onRotationReady, 500, this);
            }
        }
    },
    
    onRotationReady: function(me) {
        'use strict';
        me.canRotate = true;
    }
});