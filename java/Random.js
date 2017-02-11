;(function(metamorphose) {

var Random = function() {
    
};

Random.prototype.nextDouble = function() {
    return Math.random();
};

Random.prototype.nextInt = function(i) {
    return Math.floor(Math.random() * i);
};

Random.prototype.setSeed = function(seed) {

};

if (typeof module !== 'undefined') {
    module.exports = Random;
} else if (metamorphose) {
    metamorphose.Random = Random;
}
})(typeof window !== 'undefined' && window.metamorphose);
