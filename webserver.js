var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
var switchA = 4;
var switchB = 10;
var switchC = 16;
var buttonA = new Gpio(switchA, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
var buttonB = new Gpio(switchB, 'in', 'both');
var buttonC = new Gpio(switchC, 'in', 'both');

var list = [4,10,16];
var startTime = new Date();


http.listen(8080); //listen to port 8080

function random(without) {
  var out = list[Math.floor((Math.random()*list.length))];
  if (out == without){
    return random(without);
  }else{
    return out;
  }
}

function timestamp(endTime) {
  var delta = endTime - startTime;
  console.log(delta);
}


function interrupt(sw,next) {
  time = new Date();
  console.log(time.toUTCString());
  console.log(Math.floor(time.toUTCString()/1000) + ' sec ' + time.toUTCString()-(Math.floor(time.toUTCString()/1000)) + ' millisec');
  if(sw == switchA && next == switchA){
    next = random(switchA);
  }else if(sw == switchB && next == switchB){
    next = random(switchB);
  }else if(sw == switchC && next == switchC){
    next = random(switchC);
  }
  console.log(next);
  return next;
//  socket.emit('next',next);

}

function handler (req, res) { //create server
  fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
}

io.sockets.on('connection', function (socket) {// WebSocket Connection
  var next = "4"; //static variable for current status
  socket.emit('next', next);
  console.log(next);
  buttonA.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    var endTime = new Date();
    timestamp(endTime);
    next = interrupt(switchA,next);
    socket.emit('next', next); //send button status to client
  });
  buttonB.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    var endTime = new Date();
    timestamp(endTime);
    next = interrupt(switchB,next);
    socket.emit('next',next); //send button status to client
  });
  buttonC.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    var endTime = new Date();
    timestamp(endTime);
    next = interrupt(switchC,next);
    socket.emit('next', next); //send button status to client
  });
  // socket.on('light', function(data) { //get light switch status from client
  //   lightvalue = data;
  //   if (lightvalue != LED.readSync()) { //only change LED if status has changed
  //     LED.writeSync(lightvalue); //turn LED on or off
  //   }
  // });
});

process.on('SIGINT', function () { //on ctrl+c
  // LED.writeSync(0); // Turn LED off
  // LED.unexport(); // Unexport LED GPIO to free resources
  buttonA.unexport(); // Unexport Button GPIO to free resources
  buttonB.unexport(); // Unexport Button GPIO to free resources
  buttonC.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});
