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

module.exports = Random;
