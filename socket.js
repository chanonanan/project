var express = require('express');
var router = express.Router();
var recordController = require('./app/web/record');
var testController = require('./app/web/test');

var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io2 = require('socket.io')(http) //require socket.io module and pass the http object (server)

// var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
http.listen(8080); //listen to port 8080
// handler for web service
function handler(req, res) { //create server
    fs.readFile('public/index.html', function (err, data) { //read file index.html in public folder
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' }); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' }); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}

io2.sockets.on('connection', function (socket) {// WebSocket Connection
    var direction = 0; //static variable for current status
    socket.emit('direction', direction);
    socket.on('direction', function(data) { //get light switch status from client
        direction = data;
      if (direction) {
        console.log("direction",direction); //turn LED on or off, for now we will just show it in console.log
      }
    });
  });

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO


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
var button1;
var button2;
var button3;
var button4;
var button5;
var button6;
var button7;
// var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output

//place switch
// 2       3
// 4  17  27
// 22     10
//match in code
// 1       2
// 3   4   5
// 6       7

//Variable
var startTime;
var start;
var delta;
var count = 0;
var length = 0;
// real
var pattern = "4142454746434";
// test
// var pattern = "123123123";
var next;
var oldButton;
var isInit = false;
var isFreeRun = false;
var allowError = false;
var test_id;

function initButton(io) {
    button1 = new Gpio(switch1, 'in', edge, { debounceTimeout: debounce });
    button2 = new Gpio(switch2, 'in', edge, { debounceTimeout: debounce });
    button3 = new Gpio(switch3, 'in', edge, { debounceTimeout: debounce });
    button4 = new Gpio(switch4, 'in', edge, { debounceTimeout: debounce });
    button5 = new Gpio(switch5, 'in', edge, { debounceTimeout: debounce });
    button6 = new Gpio(switch6, 'in', edge, { debounceTimeout: debounce });
    button7 = new Gpio(switch7, 'in', edge, { debounceTimeout: debounce });
    button1.watch(function (err, value) { matchButton(err, value, switch1, io) });
    button2.watch(function (err, value) { matchButton(err, value, switch2, io) });
    button3.watch(function (err, value) { matchButton(err, value, switch3, io) });
    button4.watch(function (err, value) { matchButton(err, value, switch4, io) });
    button5.watch(function (err, value) { matchButton(err, value, switch5, io) });
    button6.watch(function (err, value) { matchButton(err, value, switch6, io) });
    button7.watch(function (err, value) { matchButton(err, value, switch7, io) });
    isInit = true;
}

function unExportBtn() {
    isInit = false;
    // LED.writeSync(0); // Turn LED off
    // LED.unexport(); // Unexport LED GPIO to free resources
    button1.unexport(); // Unexport Button GPIO to free resources
    button2.unexport(); // Unexport Button GPIO to free resources
    button3.unexport(); // Unexport Button GPIO to free resources
    button4.unexport(); // Unexport Button GPIO to free resources
    button5.unexport(); // Unexport Button GPIO to free resources
    button6.unexport(); // Unexport Button GPIO to free resources
    button7.unexport(); // Unexport Button GPIO to free resources
}

process.on('SIGINT', function () { //on ctrl+c
    if (isInit) {
        unExportBtn();
    }
    process.exit(); //exit completely
});

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

function getNumber(c) {
    switch (c) {
        case switch1:
            return '1';
        case switch2:
            return '2';
        case switch3:
            return '3';
        case switch4:
            return '4';
        case switch5:
            return '5';
        case switch6:
            return '6';
        case switch7:
            return '7';
    }
}

function getPlateNumber(c) {
    switch (c) {
        case '1':
            return 'ซ้ายหน้า (1)';
        case '2':
            return 'ขวาหน้า (2)';
        case '3':
            return 'ซ้าย (3)';
        case '4':
            return 'กลาง (4)';
        case '5':
            return 'ขวา (5)';
        case '6':
            return 'ซ้ายหลัง (6)';
        case '7':
            return 'ขวาหลัง (7)';
    }
}

function stopTime(stop, io) {
    var diff = stop - start;
    var d = new Date(diff);
    console.log('Stop: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds()); // "4:59"
    var ms;
    if (d.getUTCMilliseconds() < 100) {
        ms = '0' + d.getUTCMilliseconds();
    } else {
        ms = d.getUTCMilliseconds().toString();
    }
    var front_ms = ms[0] + ms[1];
    var last_ms = ms[2];
    io.sockets.emit('stop', { time: [d.getUTCMinutes(), d.getUTCSeconds(), parseInt(front_ms), parseInt(last_ms)], text: "Stop", pattern: pattern });
    io.sockets.emit('start', false);
    if (!isInit) {
        unExportBtn();
    }
}

//create time stamp
function timestamp(sw, io) {
    var endTime = new Date();
    delta = endTime - startTime;
    var d = new Date(delta);
    console.log('Timelab: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds()); // "4:59"
    console.log(delta + 'millisec');
    console.log("Time: " + startTime);
    console.log("startTime: " + startTime);
    console.log("endTime: " + endTime);
    console.log("count: " + count);
    var old_count = count - 1;
    io.sockets.emit('lap', { lap: count, time: [d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()], from: getPlateNumber(pattern[old_count]), to: getPlateNumber(pattern[count]) });
    recordController.store({ lap: count, duration: parseInt(delta), from: pattern[old_count], to: pattern[count], test_id: test_id });
    startTime = endTime;
    // next = random(sw);
    count++;
    if (count == length) {
        var stop = endTime;
        stopTime(stop, io);
        next = null;
        count = 0;
    } else {
        if (!isFreeRun) {
            io.sockets.emit('pattern', { text: "Next: " + getPlateNumber(pattern[count]) });
            next = getPattern(count);
        }
    }

    return next;
}

function matchButton(err, value, button, io) {
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }
    if (isFreeRun) {
        if (count == 0) {
            startTime = new Date();
            start = startTime;
            count++;
            length++;
            pattern = getNumber(button);
            io.sockets.emit('start', true);
            // io.sockets.emit('pattern', { next: getPlateNumber(pattern[count]), text: "Next" })
        } else {
            pattern += getNumber(button);
            length++;
            next = timestamp(button, io);
        }
    } else {
        if (allowError) {

        } else {
            if (next == button) {
                if (count == 0) {
                    startTime = new Date();
                    start = startTime;
                    count++;
                    next = getPattern(count);
                    io.sockets.emit('start', true);
                    io.sockets.emit('pattern', { text: "Next: " + getPlateNumber(pattern[count]) })
                    io2.sockets.emit('direction', pattern[count]);
                } else {
                    if (getPattern(count - 1) == oldButton) {
                        next = timestamp(button, io);
                        // io.sockets.emit('next', next); //send button status to client
                        // io.sockets.emit('delta', delta);
                        // socket.emit('count', count);
                        console.log('Next: ', next);

                    }

                }
                oldButton = button;
            }
        }

    }


}

module.exports = (io) => {

    io.on('connection', function (socket) {
        console.log('user connected');
        io2.sockets.emit('direction', 1);
        count = 0;
        next = null;

        socket.on('start', function (message) {
            start = new Date();
            io.sockets.emit('start', true);
        })

        socket.on('stop', function (message) {
            var stop = new Date();
            stopTime(stop, io);
        })


        socket.on('disconnect', function () {
            console.log('user disconnected');
            if (isInit) {
                unExportBtn();
            }
        });

        socket.on('message', function (message) {
            // console.log(message);
            io.sockets.emit('message', { type: 'new-message', text: "message" })
        })

        socket.on('test', function (test) {
            console.log(test.style);
            test_id = test.id;
            pattern = test.Pattern.pattern;
            length = test.Pattern.length;
            if (test.style != 2) {
                if (test.style == 1) {
                    allowError = true;
                } else {
                    allowError = false;
                }
                io.sockets.emit('pattern', { text: "Start: " + getPlateNumber(pattern[count]) });
                isFreeRun = false;
            } else {
                io.sockets.emit('pattern', { text: "Free Run" });
                isFreeRun = true;
                length = 1;
            }

            initButton(io);
        })
    });

};