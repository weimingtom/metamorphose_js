;(function(metamorphose) {

var SystemUtil = function(){
};

SystemUtil.out = new PrintStream();
		
SystemUtil.arraycopy = function(src, srcPos, dest, destPos, length) {
    if(src != null && dest != null && src instanceof Array && dest instanceof Array) {
        for (var i = destPos; i < destPos + length; i++) {　
            dest[i] = src[i]; 
            //trace("arraycopy:", i, (src as Array)[i]); 
        }
    }
};

SystemUtil.gc = function() {

};

SystemUtil.identityHashCode = function(obj) {
    return 0;
};

SystemUtil.getResourceAsStream = function(s) {
    return null;
};

SystemUtil.currentTimeMillis = function() {
    return 0;			
};

if (typeof module !== 'undefined') {
    module.exports = SystemUtil;
} else if (metamorphose) {
    metamorphose.SystemUtil = SystemUtil;
}
})(typeof window !== 'undefined' && window.metamorphose);
