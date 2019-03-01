//Http
var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)

//GPIO
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
// var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output

// Define GPIO port
var switch1 = 2;
var switch2 = 3;
var switch3 = 4;
var switch4 = 8;
var switch5 = 10;
var switch6 = 15;
var switch7 = 17;

var debounce = 250;
var edge = 'rising';

//Define button to detect input
var button1 = new Gpio(switch1, 'in', edge, {debounceTimeout: debounce});
var button2 = new Gpio(switch2, 'in', edge, {debounceTimeout: debounce});
var button3 = new Gpio(switch3, 'in', edge, {debounceTimeout: debounce});
var button4 = new Gpio(switch4, 'in', edge, {debounceTimeout: debounce});
var button5 = new Gpio(switch5, 'in', edge, {debounceTimeout: debounce});
var button6 = new Gpio(switch6, 'in', edge, {debounceTimeout: debounce});
var button7 = new Gpio(switch7, 'in', edge, {debounceTimeout: debounce});


//place switch
// 2       3
// 4  17  27
// 22     10
//match in code
// 1       2
// 3   4   5
// 6       7

//Variable
var list = [4,10,16];
var startTime;
var delta;
var count = 0;
// real
var pattern = "4142454746434";
// test
// var pattern = "123123123";
var next;
var oldButton;


http.listen(8080); //listen to port 8080

// random next button
function random(without) {
  var out = list[Math.floor((Math.random()*list.length))];
  if (out == without){
    return random(without);
  }else{
    return out;
  }
}

// get pattern for next button
function getPattern(c) {
  switch (pattern[c]) {
    case '1':
      return switch1;
    case '2':
      return switch2;
    case '3':
      return switch3;
    case '4':
      return switch4;
    case '5':
      return switch5;
    case '6':
      return switch6;
    case '7':
      return switch7;
  }
}

//create time stamp
function timestamp(sw) {
  var endTime = new Date();
  delta = endTime - startTime;
  var intTime = parseInt(delta);
  var d = new Date(delta);
  console.log('Timelab: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds() ); // "4:59"
  console.log(delta + 'millisec');
  console.log("Time: " + startTime);
  console.log("startTime: " + startTime);
  console.log("endTime: " + endTime);
  startTime = endTime;
  // next = random(sw);
  count++;
  next = getPattern(count);
  return next;
}

// handler for web service
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

function matchButton(err, value,button){
  if (err) { //if an error
    console.error('There was an error', err); //output error message to console
    return;
  }

  if(next == button){
    if(count == 0){
      startTime = new Date();
      count++;
      next = getPattern(count);
      io.sockets.emit('startTime', startTime);
      io.sockets.emit('next', next); //send button status to client
    }else{
      if(getPattern(count-1) == oldButton){
        next = timestamp(button);
        io.sockets.emit('next', next); //send button status to client
        io.sockets.emit('delta', delta);
        // socket.emit('count', count);
        console.log('Next: ',next);
      }
      
    }
    oldButton = button;
  }
  
}

// connect socket io
io.sockets.on('connection', function (socket) {// WebSocket Connection
  console.log('user connected');
  next = getPattern(count);
  io.sockets.emit('next', next);
  
  // console.log(next);
  button1.watch(function(err,value) { matchButton(err, value, switch1)} );
  button2.watch(function(err,value){ matchButton(err, value, switch2)} );
  button3.watch(function(err,value){ matchButton(err, value, switch3)} );
  button4.watch(function(err,value){ matchButton(err, value, switch4)} );
  button5.watch(function(err,value){ matchButton(err, value, switch5)} );
  button6.watch(function(err,value){ matchButton(err, value, switch6)} );
  button7.watch(function(err,value){ matchButton(err, value, switch7)} );

  socket.on('disconnect', () => {
    console.log('user disconnected');
    count = 0;
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
  button1.unexport(); // Unexport Button GPIO to free resources
  button2.unexport(); // Unexport Button GPIO to free resources
  button3.unexport(); // Unexport Button GPIO to free resources
  button4.unexport(); // Unexport Button GPIO to free resources
  button5.unexport(); // Unexport Button GPIO to free resources
  button6.unexport(); // Unexport Button GPIO to free resources
  button7.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});
