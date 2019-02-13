var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)




http.listen(8080); //listen to port 8080


var list = [4,10,16];



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
  console.log("startTime: " + startTime);
  console.log("endTime: " + endTime);
  startTime = endTime;
  next = random(sw);
  return next;
}



io.sockets.on('connection', function (socket) {// WebSocket Connection
  console.log('user connected');
  startTime = new Date();
  var next = list[Math.floor((Math.random()*list.length))]; //static variable for current status
  socket.emit('next', next);
  socket.emit('startTime', startTime);
  socket.emit('startrun', false);
  // console.log(next);

  socket.on('startrun', function (data) {
    console.log('startrun 64',data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected')
  });

});
