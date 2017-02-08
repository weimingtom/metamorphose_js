//注意：Character.toString用String.fromCharCode()代替
var Character = function() {

};

Character.isUpperCase = function(ch) {
    return ch >= 'A'.charCodeAt() && ch <= 'Z'.charCodeAt();
};

Character.isLowerCase = function(ch) {
    return ch >= 'a'.charCodeAt() && ch <= 'z'.charCodeAt();
};

Character.isDigit = function(ch) {
    return ch >= '0'.charCodeAt() && ch <= '9'.charCodeAt();
};

Character.toLowerCase = function(ch) {
    return String.fromCharCode(ch).toLowerCase();	
};

module.exports = Character;
