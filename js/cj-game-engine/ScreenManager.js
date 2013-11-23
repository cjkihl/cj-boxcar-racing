/**
 * The screen-manager handles different screens.
 * @author Carl-Johan Kihl
 * @since 2013-10-24
 * @namespace Game
 */
Game.ScreenManager = Class.create({
    
    initialize: function(options) {
        'use strict';
        this.gui = options.gui;
        this.levels = options.levels;
    },
    
    setScreen: function(screen) {
        'use strict';
        this.gui.innerHTML = '';
        screen(this.gui);
        return this;
    },
    hide: function(){
        'use strict';
        $(this.gui).hide();
        return this;
    },
    show: function() {
        'use strict';
        $(this.gui).show();
        return this;
    }
});