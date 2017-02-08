//see http://codesnipp.it/code/939
var MathUtil = function() {

};

//弧度转换为角度
// convert radians to degrees  		
MathUtil.toDegrees = function(rad) {
    return (rad / 180 * Math.PI);
};

// convert degrees to radians  
//角度转换为弧度
MathUtil.toRadians = function(deg) {  
    return (deg * Math.PI / 180);  
};

module.exports = MathUtil;
