var five = require("johnny-five"),
    board,
	colors = require("colors"),
	Spacebrew = require('./sb-1.3.0').Spacebrew,
	sb,
	sensors = [],
	config = require("./machine");


// setup spacebrew
sb = new Spacebrew.Client( config.server, config.name, config.description );  // create spacebrew client object

var signal_led,
    push_button;

// create the spacebrew subscription channels
//sb.addPublish("config", "string", "");	// publish config for handshake
//sb.addSubscribe("config", "boolean");	// subscription for config handshake

var subscribers = {
    boolean: false,
    range: false,
    string: false,
    custom: false
};


function setUpPubAndSub(){
	for(var i = 0; i < config.publishers.sensors.length; i++){
		console.log('creating publisher sensor with: ', config.publishers.sensors[i].name, config.publishers.sensors[i].signal.type, config.publishers.sensors[i].signal.default);
		sb.addPublish( config.publishers.sensors[i].name, config.publishers.sensors[i].signal.type, config.publishers.sensors[i].signal.default );
	}

    //set up signal button
    if(typeof config.publishers.button !== "undefined"){
        console.log('creating publishers push button with: ', config.publishers.button.name, config.publishers.button.signal.type );
        sb.addPublish( config.publishers.button.name, config.publishers.button.signal.type, config.publishers.button.signal.default );
    }

    //set up signal LED
    if(typeof config.subscribers.signal_led !== "undefined"){
        console.log('creating subscriber signal LED with: ', config.subscribers.signal_led.name, config.subscribers.signal_led.signal.type );
        sb.addSubscribe( config.subscribers.signal_led.name, config.subscribers.signal_led.signal.type );
        sb.onBooleanMessage = onBooleanMessage;
    }
}

setUpPubAndSub();

console.log('config.sensors:');
console.dir(config.sensors);



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

        //set up all publisher sensors
    	for(var index = 0; index < config.publishers.sensors.length; index++){
            var i = index;//local variable to maintain the scope in listener

            // construct sensor with params from machine.json
    		sensors[i] = new five.Sensor( config.publishers.sensors[i].params );

            // set up data listener to publish
    		sensors[i].scale( config.publishers.sensors[i].params.scale ).on("data", function(err){
    			if(err){
                    console.log('error thrown with message: ' + err);
                    return false;
                }
                console.log([
                    config.publishers.sensors[i].name.magenta,
                    config.publishers.sensors[i].signal.type.grey,
                    this.value.toString().cyan
                    ].join(" "));

    			sb.send(config.publishers.sensors[i].name, config.publishers.sensors[i].signal.type, this.value);
    		});
    	}//end for

        //set up signal LED
        if(typeof config.subscribers.signal_led !== "undefined"){
            signal_led = new five.Led( config.subscribers.signal_led.params );
        }

        //set up push button
        if(typeof config.publishers.button !== "undefined"){
            push_button = new five.Button( config.publishers.button.params );

            // "down" the button is pressed
            button.on("down", function() {
                console.log("push button down");
                sb.send(config.publishers.button.name, config.publishers.button.signal.type, "down");
            });

            // "hold" the button is pressed for specified time.
            //        defaults to 500ms (1/2 second)
            //        set
            button.on("hold", function() {
                console.log("push button hold");
                sb.send(config.publishers.button.name, config.publishers.button.signal.type, "hold");
            });

            // "up" the button is released
            button.on("up", function() {
                console.log("push button up");
                sb.send(config.publishers.button.name, config.publishers.button.signal.type, "up");
            });
        }
    });

}





function onBooleanMessage( name, value ){
    switch(name){
        case "signal led":
            if(value == true){
                signal_led.on();
            }else{
                signal_led.off();
            }
            break;
    }
}















