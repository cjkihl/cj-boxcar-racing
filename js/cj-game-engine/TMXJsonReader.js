/**
 * TMX json reader module. Loads an TMX-json level-file
 * @author Carl-Johan Kihl
 * @since 2013-10-24
 * @namespace Game
 */
Game.TMXJsonReader = (function TMXJsonReader() {
    'use strict';
    var resource_path = 'resources',
    
    /**
     * Loads an TMX json level-file async with ajax
     * @param {String} url The url to the level-file
     * @param {function(level)} callback Will be called when the level is loaded
     */
    loadAsync = function(url, options) {
        
        new Ajax.Request(url,{
            method:'get',
            onSuccess: function(t) {
                var q,layer, data = t.responseText.evalJSON(),
                
                //Create the level
                level = new Game.Level({
                width: data.width * data.tilewidth,
                height: data.height * data.tileheight,
                images: readImages(data)
                });
            
                //Read layers into the level
                for (q = 0; q < data.layers.length; q++) {
                    layer = data.layers[q];
                    if (layer.type === 'imagelayer') {
                        level.backgrounds.push(readImageLayer(layer));
                    }
                    if (layer.type === 'tilelayer') {
                        layer = readTileLayer(data,layer,level);
                        level.layers.push(layer);
                    }
                }
                
                //Fire onSuccess callback
                if(options.onSuccess !== undefined) { options.onSuccess(level); }
            } 
        });
    },

    /**
     * Read all the images from the TMX-file and puts it in an resource-array
     * @param {object} data The tmx-data
     * @returns {Array} the images-resources
     */
    readImages = function(data) {

        var images = {},i,l;
        
        //Get images from all image layers
        for(i=0;i<data.layers.length;i++) {
            if(data.layers[i].type==='imagelayer'){
                l = data.layers[i];
                images[l.name] = resource_path + '/images/' + l.image.substring(l.image.lastIndexOf('\/') + 1);
            }
        }
       
        //Get all the images from the tilemaps
        for (i=0;i<data.tilesets.length;i++) {
            l = data.tilesets[i];
            images[l.name] = resource_path + '/tilemaps/' + l.image.substring(l.image.lastIndexOf('\/') + 1);
        }
    
        return images;
    },
    /**
     * Reads a tile layer from the tmx-data
     * @param {Object} The Tmx-data
     * @param {Obejct} The tmx-layer
     * @param {Game.Level} The level
     * @returns {Object} the layer
     */    
    readTileLayer = function(data,layer,level) {
        var entities = [], platforms = [], properties, tileType,
                fixDef = new Game.b2FixtureDef(), bodyDef = new Game.b2BodyDef(),
                tileset, tileIndex = 0, entity, numOfTilesX, indexOnTile, indexOnAll, x,y,i,j,b;
        
                fixDef.shape = new Game.b2PolygonShape();
                        
        //Read tile-data
        for (i = 0; i < layer.data.length; i++) {
            
            if (layer.data[i] === 0) { continue; }
                

            //Get tileIndex for the tile
            for (j = 1; j < data.tilesets.length; j++) {
                if (layer.data[i] < data.tilesets[j].firstgid) { break; }
                  
                tileIndex = j;
            }

            //Get tileset
            tileset = data.tilesets[tileIndex];
            numOfTilesX = ~~(tileset.imagewidth / (tileset.tilewidth + tileset.spacing));
            indexOnAll = layer.data[i] - 1 ;
            indexOnTile = (indexOnAll - tileset.firstgid + 1);
            
            tileType = null;
            
            //See if the tile has a type propery set
            if (tileset.tileproperties !== undefined &&
                    tileset.tileproperties[indexOnAll] !== undefined) {
                    properties = tileset.tileproperties[indexOnAll];
                    if(properties.type !== undefined) {
                        tileType = properties.type;
                    } 
            }
            
            //Create a new sprite for the tile
            entity = new Game.Sprite({},level);
            
            //Set entity properties
            entity.image = tileset.name;
            entity.width = tileset.tilewidth;
            entity.height = tileset.tileheight;
            x = i % layer.width;
            y = (i - x) / layer.width;
            entity.sourceX = indexOnTile % numOfTilesX;
            entity.sourceY = ~~((indexOnTile - entity.sourceX) / numOfTilesX);

            entity.x = x * data.tilewidth;
            entity.y = y * data.tileheight - data.tileheight;
            entity.sourceX *= tileset.tilewidth + tileset.spacing;
            entity.sourceY *= tileset.tileheight + tileset.spacing;
            entity.sourceWidth = tileset.tilewidth;
            entity.sourceHeight = tileset.tileheight;
            
            if(tileType!==null) { 
                switch (tileType) {
                case 'start':
                    entity = new Game.Vehicle(Object.extend({x:entity.x, y:entity.y},properties),level);
                    //Create camera
                    level.camera = new Game.Camera(game.canvas.width, game.canvas.height, level);
                    level.camera.target = entity;
                    break;
                case 'exit':
                    bodyDef.type = Game.b2Body.b2_staticBody;
                    fixDef.shape.SetAsBox(entity.width / Game.BOX2D_SCALE / 2, entity.height / Game.BOX2D_SCALE / 2);
                    fixDef.isSensor = false;
                    bodyDef.position.Set((entity.x + entity.width / 2) / Game.BOX2D_SCALE, (entity.y + entity.height /2) / Game.BOX2D_SCALE);
                    b = level.world.CreateBody(bodyDef);
                    b.SetUserData({type:'exit',entity:null});
                    b.CreateFixture(fixDef);
                break;
                case 'box':
                    entity = new Game.Box(entity,properties,level);
                    break;
                case 'platform':
                    if (platforms[y] === undefined) {
                        platforms[y] = [];
                    }
                    platforms[y][x] = true;
                    break;
                case 'solid.315':
                    bodyDef.type = Game.b2Body.b2_staticBody;
                    fixDef.isSensor = false;
                    fixDef.shape.SetAsArray(
                            [new Game.b2Vec2(0, entity.height / Game.BOX2D_SCALE),
                                new Game.b2Vec2(entity.width / Game.BOX2D_SCALE, 0),
                                new Game.b2Vec2(entity.width / Game.BOX2D_SCALE, entity.height / Game.BOX2D_SCALE)],
                            3);
                    bodyDef.position.Set(entity.x / Game.BOX2D_SCALE, entity.y / Game.BOX2D_SCALE);
                    level.world.CreateBody(bodyDef).CreateFixture(fixDef);
                    break;
                case 'solid.45':
                    bodyDef.type = Game.b2Body.b2_staticBody;
                    fixDef.isSensor = false;
                    fixDef.shape.SetAsArray(
                            [new Game.b2Vec2(0, entity.height / Game.BOX2D_SCALE),
                                new Game.b2Vec2(0, 0),
                                new Game.b2Vec2(entity.width / Game.BOX2D_SCALE, entity.height / Game.BOX2D_SCALE)],
                            3);
                    bodyDef.position.Set(entity.x / Game.BOX2D_SCALE, entity.y / Game.BOX2D_SCALE);
                    level.world.CreateBody(bodyDef).CreateFixture(fixDef);
                    break;

            }
        }
            entities.push(entity);
        }
    
        createPlatforms(platforms,data,level.world);
        return {
            entities: entities 
        };
    },
    
        /**
         * Create plaforms for all solids from the array.
         * @param {Array} solids 2-dimensional array with solid data
         * @param {Object} data TXM-Level data
         * @param {Object} world Box2D World
         */
    createPlatforms = function(solids,data,world) {
        
            var fixDef = new Game.b2FixtureDef(),
                bodyDef = new Game.b2BodyDef(),y,x;

            bodyDef.type = Game.b2Body.b2_staticBody;
            fixDef.shape = new Game.b2PolygonShape();
            fixDef.shape.SetAsBox(data.tilewidth / Game.BOX2D_SCALE, 0.1);

            for(y=0;y < solids.length; y++) {    
                if(solids[y] !== undefined) {
                for(x=0; x < solids[y].length; x++) {
                   
                    if(solids[y][x]!==undefined) {
                        bodyDef.position.Set((x * data.tilewidth + data.tilewidth) / Game.BOX2D_SCALE, (y * data.tileheight - data.tileheight + 3) / Game.BOX2D_SCALE);
                        world.CreateBody(bodyDef).CreateFixture(fixDef);     
                    }
                }
              }  
            }
        },
    /**
     * Reads an image layer from the tmx-file
     * @param {Object} The tmx-layer to read
     * @returns {Object} The image layer
     */    
    readImageLayer = function(layer) {
        var p = layer.properties || {};
        
        p.pX = p.pX || 0;
        p.pY = p.pY || 0;
        if(p.repeatX ===undefined) { p.repeatX = true; }
        if(p.repeatY ===undefined) { p.repeatY = false; }
        p.scaleX = p.scaleX || 1;
        p.scaleY = p.scaleY || 1;
        p.image = layer.name;
        return p;
    };

    return {
        loadAsync: loadAsync
    };
})();