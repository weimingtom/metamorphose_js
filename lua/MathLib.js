// Each function in the library corresponds to an instance of
// this class which is associated (the 'which' member) with an integer
// which is unique within this class.  They are taken from the following
// set.

MathLib.ABS = 1;
//private static const acos:int = 2;
//private static const asin:int = 3;
//private static const atan2:int = 4;
//private static const atan:int = 5;
MathLib.CEIL = 6;
//private static const cosh:int = 7;
MathLib.COS = 8;
MathLib.DEG = 9;
MathLib.EXP = 10;
MathLib.FLOOR = 11;
MathLib.FMOD = 12;
//private static const frexp:int = 13;
//private static const ldexp:int = 14;
//private static const log:int = 15;
MathLib.MAX = 16;
MathLib.MIN = 17;
MathLib.MODF = 18;
MathLib.POW = 19;
MathLib.RAD = 20;
MathLib.RANDOM = 21;
MathLib.RANDOMSEED = 22;
//private static const sinh:int = 23;
MathLib.SIN = 24;
MathLib.SQRT = 25;
//private static const tanh:int = 26;
MathLib.TAN = 27;

MathLib._rng = new Random();

/** Constructs instance, filling in the 'which' member. */
MathLib = function(which) {
    /**
    * Which library function this object represents.  This value should
    * be one of the "enums" defined in the class.
    */
    this._which = which;
};

/**
 * Implements all of the functions in the Lua math library.  Do not
 * call directly.
 * @param L  the Lua state in which to execute.
 * @return number of returned parameters, as per convention.
 */
MathLib.prototype.luaFunction = function(L) {
    switch (this._which) {
    case ABS:
        return abs(L);

    case CEIL:
        return ceil(L);

    case COS:
        return cos(L);

    case DEG:
        return deg(L);

    case EXP:
        return exp(L);

    case FLOOR:
        return floor(L);

    case FMOD:
        return fmod(L);

    case MAX:
        return max(L);

    case MIN:
        return min(L);

    case MODF:
        return modf(L);

    case POW:
        return pow(L);

    case RAD:
        return rad(L);

    case RANDOM:
        return random(L);

    case RANDOMSEED:
        return randomseed(L);

    case SIN:
        return sin(L);

    case SQRT:
        return sqrt(L);

    case TAN:
        return tan(L);
    }
    return 0;
}

/**
 * Opens the library into the given Lua state.  This registers
 * the symbols of the library in the global table.
 * @param L  The Lua state into which to open.
 */
MathLib.open = function(L) {
    var t = L.__register("math");

    r(L, "abs", ABS);
    r(L, "ceil", CEIL);
    r(L, "cos", COS);
    r(L, "deg", DEG);
    r(L, "exp", EXP);
    r(L, "floor", FLOOR);
    r(L, "fmod", FMOD);
    r(L, "max", MAX);
    r(L, "min", MIN);
    r(L, "modf", MODF);
    r(L, "pow", POW);
    r(L, "rad", RAD);
    r(L, "random", RANDOM);
    r(L, "randomseed", RANDOMSEED);
    r(L, "sin", SIN);
    r(L, "sqrt", SQRT);
    r(L, "tan", TAN);

    L.setField(t, "pi", Lua.valueOfNumber(Math.PI));
    L.setField(t, "huge", Lua.valueOfNumber(Number.POSITIVE_INFINITY));
};

/** Register a function. */
MathLib.r = function(L, name, which) {
    var f = new MathLib(which);
    L.setField(L.getGlobal("math"), name, f);
}

MathLib.abs = function(L) {
    L.pushNumber(Math.abs(L.checkNumber(1)));
    return 1;
};

MathLib.ceil = function(L) {
    L.pushNumber(Math.ceil(L.checkNumber(1)));
    return 1;
};

MathLib.cos = function(L) {
    L.pushNumber(Math.cos(L.checkNumber(1)));
    return 1;
};

MathLib.deg = function(L) {
    L.pushNumber(MathUtil.toDegrees(L.checkNumber(1)));
    return 1;
};

MathLib.exp = function(L) {
    // CLDC 1.1 has Math.E but no exp, pow, or log.  Bizarre.
    L.pushNumber(Lua.iNumpow(Math.E, L.checkNumber(1)));
    return 1;
};

MathLib.floor = function(L) {
    L.pushNumber(Math.floor(L.checkNumber(1)));
    return 1;
};

MathLib.fmod = function(L) {
    L.pushNumber(L.checkNumber(1) % L.checkNumber(2));
    return 1;
};

MathLib.max = function(L) {
    var n = L.getTop(); // number of arguments
    var dmax = L.checkNumber(1);
    for (var i = 2; i <= n; ++i) {
        var d = L.checkNumber(i);
        dmax = Math.max(dmax, d);
    }
    L.pushNumber(dmax);
    return 1;
};

MathLib.min = function(L) {
    var n = L.getTop(); // number of arguments
    var dmin = L.checkNumber(1);
    for (var i = 2; i <= n; ++i) {
        var d = L.checkNumber(i);
        dmin = Math.min(dmin, d);
    }
    L.pushNumber(dmin);
    return 1;
};

MathLib.modf = function(L) {
    var x = L.checkNumber(1);
    var fp = x % 1;
    var ip = x - fp;
    L.pushNumber(ip);
    L.pushNumber(fp);
    return 2;
};

MathLib.pow = function(L) {
    L.pushNumber(Lua.iNumpow(L.checkNumber(1), L.checkNumber(2)));
    return 1;
};

MathLib.rad = function(L) {
    L.pushNumber(MathUtil.toRadians(L.checkNumber(1)));
    return 1;
};

MathLib.random = function(L) {
    // It would seem better style to associate the java.util.Random
    // instance with the Lua instance (by implementing and using a
    // registry for example).  However, PUC-rio uses the ISO C library
    // and so will share the same random number generator across all Lua
    // states.  So we do too.
    switch (L.getTop()) { // check number of arguments
        case 0:   // no arguments
            L.pushNumber(MathLib._rng.nextDouble());
            break;

        case 1:   // only upper limit
            {
                var u = L.checkInt(1);
                L.argCheck(1 <= u, 1, "interval is empty");
                L.pushNumber(MathLib._rng.nextInt(u) + 1);
            }
            break;

        case 2:   // lower and upper limits
            {
                var l = L.checkInt(1);
                var u2 = L.checkInt(2);
                L.argCheck(l <= u2, 2, "interval is empty");
                L.pushNumber(MathLib._rng.nextInt(u2) + l);
            }
            break;

        default:
            return L.error("wrong number of arguments");
    }
    return 1;
};

MathLib.randomseed = function(L) {
    MathLib._rng.setSeed(L.checkNumber(1) as Number);
    return 0;
};

MathLib.sin = function(L) {
    L.pushNumber(Math.sin(L.checkNumber(1)));
    return 1;
};

MathLib.sqrt = function(L) {
    L.pushNumber(Math.sqrt(L.checkNumber(1)));
    return 1;
};

MathLib.tan = function(L) {
    L.pushNumber(Math.tan(L.checkNumber(1)));
    return 1;
};

module.exports = MathLib;
