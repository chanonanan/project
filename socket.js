var express = require('express');
var router = express.Router();

//GPIO
// var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
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

// //Define button to detect input
// var button1 = new Gpio(switch1, 'in', edge, {debounceTimeout: debounce});
// var button2 = new Gpio(switch2, 'in', edge, {debounceTimeout: debounce});
// var button3 = new Gpio(switch3, 'in', edge, {debounceTimeout: debounce});
// var button4 = new Gpio(switch4, 'in', edge, {debounceTimeout: debounce});
// var button5 = new Gpio(switch5, 'in', edge, {debounceTimeout: debounce});
// var button6 = new Gpio(switch6, 'in', edge, {debounceTimeout: debounce});
// var button7 = new Gpio(switch7, 'in', edge, {debounceTimeout: debounce});


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
var delta;
var count = 0;
// real
var pattern = "4142454746434";
// test
// var pattern = "123123123";
var next;
var oldButton;

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
    console.log('Timelab: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds()); // "4:59"
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

function matchButton(err, value, button) {
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }

    if (next == button) {
        if (count == 0) {
            startTime = new Date();
            count++;
            next = getPattern(count);
            io.sockets.emit('startTime', startTime);
            io.sockets.emit('next', next); //send button status to client
        } else {
            if (getPattern(count - 1) == oldButton) {
                next = timestamp(button);
                io.sockets.emit('next', next); //send button status to client
                io.sockets.emit('delta', delta);
                // socket.emit('count', count);
                console.log('Next: ', next);
            }

        }
        oldButton = button;
    }

}

// process.on('SIGINT', function () { //on ctrl+c
//   // LED.writeSync(0); // Turn LED off
//   // LED.unexport(); // Unexport LED GPIO to free resources
//   button1.unexport(); // Unexport Button GPIO to free resources
//   button2.unexport(); // Unexport Button GPIO to free resources
//   button3.unexport(); // Unexport Button GPIO to free resources
//   button4.unexport(); // Unexport Button GPIO to free resources
//   button5.unexport(); // Unexport Button GPIO to free resources
//   button6.unexport(); // Unexport Button GPIO to free resources
//   button7.unexport(); // Unexport Button GPIO to free resources
//   process.exit(); //exit completely
// });

module.exports = (io) => {
    // console.log('IO: ', io);

    io.on('connection', function (socket) {
        console.log('user connected');
        // io.sockets.emit('start-test', "true");

        // button1.watch(function (err, value) { matchButton(err, value, switch1) });
        // button2.watch(function (err, value) { matchButton(err, value, switch2) });
        // button3.watch(function (err, value) { matchButton(err, value, switch3) });
        // button4.watch(function (err, value) { matchButton(err, value, switch4) });
        // button5.watch(function (err, value) { matchButton(err, value, switch5) });
        // button6.watch(function (err, value) { matchButton(err, value, switch6) });
        // button7.watch(function (err, value) { matchButton(err, value, switch7) });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('message', function (message) {
            console.log(message);
            io.sockets.emit('message', { type: 'new-message', text: "message" })
        })

        socket.on('test', function (test) {
            console.log(test);
            io.sockets.emit('patthen', { next: 'D', text: "Start" })
        })
    });

    // put any other code that wants to use the io variable
    // in here


};