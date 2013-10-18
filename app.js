var five = require("johnny-five"),
    board,
	colors = require("colors"),
	Spacebrew = require('./sb-1.3.0').Spacebrew,
	sb,
	sensors = [],
	config = require("./machine");


// setup spacebrew
sb = new Spacebrew.Client( config.server, config.name, config.description );  // create spacebrew client object


// create the spacebrew subscription channels
//sb.addPublish("config", "string", "");	// publish config for handshake
//sb.addSubscribe("config", "boolean");	// subscription for config handshake




function setUpPubAndSub(){
	for(var i = 0; i < config.publishers.length; i++){
		console.log('creating publisher with: ', config.publishers[i].name, config.publishers[i].signal.type, config.publishers[i].signal.default);
		sb.addPublish( config.publishers[i].name, config.publishers[i].signal.type, config.publishers[i].signal.default );
	}
}

setUpPubAndSub();

console.log('config.publishers:');
console.dir(config.publishers);



sb.onOpen = onOpen;

// connect to spacbrew
sb.connect();  


/**
 * Function that is called when Spacebrew connection is established
 */
function onOpen() {
	console.log( "Connected through Spacebrew as: " + sb.name() + "." );



    board = new five.Board();

    board.on("ready", function() {

    	for(var index = 0; index < config.publishers.length; index++){
            var i = index;//local variable to maintain the scope in listener

    		sensors[i] = new five.Sensor( config.publishers[i].params );

    		sensors[i].scale( config.publishers[i].params.scale ).on("data", function(x, y){
    			console.log( "value: " + this.value );
    			console.log("x: "+ x);
    			console.log("y: "+ y);
    			sb.send(config.publishers[i].name, config.publishers[i].signal.type, this.value);
    		});
    	}

    });

}





















