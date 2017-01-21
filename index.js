var UpVal = require('./lua/UpVal.js');

var upVal = new UpVal(123, null);
console.log(upVal.getOffset());
