var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
var switchA = 4;
var switchB = 10;
var switchC = 16;
var buttonA = new Gpio(switchA, 'in', 'rising', {debounceTimeout: 200}); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
var buttonB = new Gpio(switchB, 'in', 'rising', {debounceTimeout: 200});
var buttonC = new Gpio(switchC, 'in', 'rising', {debounceTimeout: 200});

var list = [4,10,16];
var startTime;
var delta;
var count = 1;


http.listen(8080); //listen to port 8080

function random(without) {
  var out = list[Math.floor((Math.random()*list.length))];
  if (out == without){
    return random(without);
  }else{
    return out;
  }
}

function timestamp(sw) {
  var endTime = new Date();
  delta = endTime - startTime;
  var intTime = parseInt(delta);
  var d = new Date(delta);
  console.log('Timelab: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds() ); // "4:59"
  console.log(delta + 'millisec');
  // console.log('Timelab: ' + Math.floor(intTime/1000) + ':' + Math.round((intTime/1000 - (Math.floor(intTime/1000)))*1000) + ' second');
  console.log("Time: " + startTime);
  console.log("startTime: " + startTime.toUTCString());
  console.log("endTime: " + endTime.toUTCString());
  startTime = endTime;
  next = random(sw);
  return next;
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
  console.log('user connected');
  startTime = new Date();
  var next = 4; //static variable for current status
  socket.emit('next', next);
  // console.log(next);
  buttonA.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    if(next == switchA && value){
      next = timestamp(switchA);
      socket.emit('next', next); //send button status to client
      socket.emit('delta', delta);
      // socket.emit('count', count);
      console.log('Next: ',next);
    }
  });
  buttonB.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    if(next == switchB && value){
      next = timestamp(switchB);
      socket.emit('next', next); //send button status to client
      socket.emit('delta', delta);
      // socket.emit('count', count);
      console.log('Next: ',next);
    }
  });
  buttonC.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    if(next == switchC && value){
      next = timestamp(switchC);
      socket.emit('next', next); //send button status to client
      socket.emit('delta', delta);
      // socket.emit('count', count);
      console.log('Next: ',next);
    }
  });
  socket.on('disconnect', () => {
    console.log('user disconnected')
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
