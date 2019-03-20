var express = require('express');
var router = express.Router();

//GPIO
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
var button1 = new Gpio(switch1, 'in', edge, { debounceTimeout: debounce });
var button2 = new Gpio(switch2, 'in', edge, { debounceTimeout: debounce });
var button3 = new Gpio(switch3, 'in', edge, { debounceTimeout: debounce });
var button4 = new Gpio(switch4, 'in', edge, { debounceTimeout: debounce });
var button5 = new Gpio(switch5, 'in', edge, { debounceTimeout: debounce });
var button6 = new Gpio(switch6, 'in', edge, { debounceTimeout: debounce });
var button7 = new Gpio(switch7, 'in', edge, { debounceTimeout: debounce });
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output

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
var isFinish = false;

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
    startTime = endTime;
    // next = random(sw);
    count++;
    if (count == length) {
        var stop = endTime;
        var diff = stop - start;
        var d = new Date(diff);
        console.log('Stop: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds()); // "4:59"
        var ms;
        if(d.getUTCMilliseconds()<100){
            ms = '0'+ d.getUTCMilliseconds();
        }else{
            ms = d.getUTCMilliseconds().toString();
        }
        var front_ms = ms[0] + ms[1];
        var last_ms = ms[2];
        io.sockets.emit('stop', { time: [d.getUTCMinutes(), d.getUTCSeconds(), parseInt(front_ms), parseInt(last_ms)], text: "Stop" })
        if(!isFinish){
            finish();
        }
    }else{
        io.sockets.emit('pattern', { next: getPlateNumber(pattern[count]), text: "Next" })
    }
    next = getPattern(count);
    return next;
}

function matchButton(err, value, button, io) {
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }

    if (next == button) {
        if (count == 0) {
            startTime = new Date();
            start = startTime;
            count++;
            next = getPattern(count);
            io.sockets.emit('start', true);
            // io.sockets.emit('next', next); //send button status to client
            io.sockets.emit('pattern', { next: getPlateNumber(pattern[count]), text: "Next" })
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

function finish() {
    isFinish = true;
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
    if(!isFinish){
        finish();
    }
    process.exit(); //exit completely
});

function ttt(io) {
    console.log(getPlateNumber(pattern[count]), getPlateNumber('4'))
    io.sockets.emit('lap', { lap: 1, time: 0.334, from: getPlateNumber('2'), to: getPlateNumber('4') });
}



module.exports = (io) => {
    // console.log('IO: ', io);

    io.on('connection', function (socket) {
        console.log('user connected');
        next = getPattern(count);
        console.log('next', next);
        console.log('count', count);
        // io.sockets.emit('start-test', "true");
        // io.sockets.emit('lap', { lap: 1, time: 0.334, from: 2, to: 4});
        // ttt(io);
        socket.on('start', function (message) {
            start = new Date();
            io.sockets.emit('start', true);
        })

        socket.on('stop', function (message) {
            // console.log(message);
            var stop = new Date();
            var diff = stop - start;
            var d = new Date(diff);
            console.log('Timelab: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds()); // "4:59"
            io.sockets.emit('stop', [d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()])
        })


        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('message', function (message) {
            // console.log(message);
            io.sockets.emit('message', { type: 'new-message', text: "message" })
        })

        socket.on('test', function (test) {
            console.log(test.Pattern.pattern);
            pattern = test.Pattern.pattern;
            length = test.Pattern.length;
            io.sockets.emit('pattern', { next: getPlateNumber(pattern[count]), text: "Start" })
            button1.watch(function (err, value) { matchButton(err, value, switch1, io) });
            button2.watch(function (err, value) { matchButton(err, value, switch2, io) });
            button3.watch(function (err, value) { matchButton(err, value, switch3, io) });
            button4.watch(function (err, value) { matchButton(err, value, switch4, io) });
            button5.watch(function (err, value) { matchButton(err, value, switch5, io) });
            button6.watch(function (err, value) { matchButton(err, value, switch6, io) });
            button7.watch(function (err, value) { matchButton(err, value, switch7, io) });
        })
    });

};