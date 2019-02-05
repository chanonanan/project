var Gpio = require('onoff').Gpio;

var buttonA = new Gpio(4, 'in', 'both');
var buttonB = new Gpio(10, 'in', 'both');
var buttonC = new Gpio(16, 'in', 'both');


buttonA.watch(function (err, value) {
  if (err) {
    console.error('There was an error', err);
  return;
  }
  console.log('valueA: ',value);
});


buttonB.watch(function (err, value) {
  if (err) {
    console.error('There was an error', err);
  return;
  }
  console.log('valueB: ',value);
});


buttonC.watch(function (err, value) {
  if (err) {
    console.error('There was an error', err);
  return;
  }
  console.log('valueC: ',value);
});

function unexportOnClose() {
  buttonA.unexport();
  buttonB.unexport();
  buttonC.unexport();

};

process.on('SIGINT', unexportOnClose);
