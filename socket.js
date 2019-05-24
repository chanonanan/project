const express = require('express');
const router = express.Router();
const recordController = require('./app/web/record');
const testController = require('./app/web/test');

const app = express();

app.use(express.static('public'));

//make way for some custom css, js and images
app.use('/asset', express.static(__dirname + '/public/asset'));

const server = app.listen(8081, function () {
    let port = server.address().port;
    console.log("Server started at http://localhost:%s", port);
});
const io2 = require('socket.io')(server) //require socket.io module and pass the http object (server)

io2.sockets.on('connection', function (socket) {// WebSocket Connection
    console.log("Display Connection");
});

const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO


// Define GPIO port
const switch1 = 2;
const switch2 = 3;
const switch3 = 4;
const switch4 = 15;
const switch5 = 17;
const switch6 = 10;
const switch7 = 8;
const switch7 = 7;

const debounce = 250;
const edge = 'falling';

//Define button to detect input
var button1;
var button2;
var button3;
var button4;
var button5;
var button6;
var button7;
var button8;
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
    button8 = new Gpio(switch8, 'in', edge, { debounceTimeout: debounce });
    button1.watch(function (err, value) { matchButton(err, value, switch1, io) });
    button2.watch(function (err, value) { matchButton(err, value, switch2, io) });
    button3.watch(function (err, value) { matchButton(err, value, switch3, io) });
    button4.watch(function (err, value) { matchButton(err, value, switch4, io) });
    button5.watch(function (err, value) { matchButton(err, value, switch5, io) });
    button6.watch(function (err, value) { matchButton(err, value, switch6, io) });
    button7.watch(function (err, value) { matchButton(err, value, switch7, io) });
    button8.watch(function (err, value) { matchButton(err, value, switch8, io) });
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

// For Demo
function getPlateNumber(c) {
    switch (c) {
        case '1':
            return 'หน้า (1)';
        case '2':
            return 'ขวา (2)';
        case '3':
            return 'หลัง (3)';
        case '4':
            return 'ซ้าย (4)';
    }
}

// function getPlateNumber(c) {
//     switch (c) {
//         case '1':
//             return 'ซ้ายหน้า (1)';
//         case '2':
//             return 'ขวาหน้า (2)';
//         case '3':
//             return 'ซ้าย (3)';
//         case '4':
//             return 'กลาง (4)';
//         case '5':
//             return 'ขวา (5)';
//         case '6':
//             return 'ซ้ายหลัง (6)';
//         case '7':
//             return 'ขวาหลัง (7)';
//     }
// }

function stopTime(stop, io) {
    let diff = stop - start;
    let d = new Date(diff);
    console.log('Stop: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds()); // "4:59"
    let ms;
    if (d.getUTCMilliseconds() < 100) {
        ms = '0' + d.getUTCMilliseconds();
    } else {
        ms = d.getUTCMilliseconds().toString();
    }
    let front_ms = ms[0] + ms[1];
    let last_ms = ms[2];
    io.sockets.emit('stop', { time: [d.getUTCMinutes(), d.getUTCSeconds(), parseInt(front_ms), parseInt(last_ms)], text: "Stop", pattern: pattern });
    io.sockets.emit('start', false);
    if (!isInit) {
        unExportBtn();
    }
}

//create time stamp
function timestamp(sw, io) {
    let endTime = new Date();
    delta = endTime - startTime;
    let d = new Date(delta);
    console.log('Timelab: ' + d.getUTCMinutes() + ':' + d.getUTCSeconds() + ':' + d.getUTCMilliseconds()); // "4:59"
    console.log(delta + 'millisec');
    console.log("Time: " + startTime);
    console.log("startTime: " + startTime);
    console.log("endTime: " + endTime);
    console.log("count: " + count);
    let old_count = count - 1;
    io.sockets.emit('lap', { lap: count, time: [d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()], from: getPlateNumber(pattern[old_count]), to: getPlateNumber(pattern[count]) });
    recordController.store({ lap: count, duration: parseInt(delta), from: pattern[old_count], to: pattern[count], test_id: test_id });
    startTime = endTime;
    // next = random(sw);
    count++;
    if (count == length) {
        let stop = endTime;
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
    console.log("matchButton",button)
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
                io2.sockets.emit('direction', { 'success': true, 'next':pattern[count]});
            }else{
                io2.sockets.emit('direction', { 'success': false, 'next':pattern[count]});
            }
        }

    }


}

module.exports = (io) => {

    io.on('connection', function (socket) {
        console.log('user connected');
        count = 0;
        next = null;

        socket.on('start', function (message) {
            start = new Date();
            io.sockets.emit('start', true);
        })

        socket.on('stop', function (message) {
            let stop = new Date();
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
                io2.sockets.emit('direction', { 'success': true, 'next':pattern[count]});
                next = getPattern(count);
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