;(function(metamorphose) {

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Proto.java#1 $
 * Copyright (c) 2006 Nokia Corporation and/or its subsidiary(-ies).
 * All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//see jillcode(Java Implementation of Lua Language, Jill):
//	http://code.google.com/p/jillcode/
//这里的代码移植自jillcode(Lua的Java实现，Jill):
//	http://code.google.com/p/jillcode/

/**
 * Models a function prototype.  This class is internal to Jill and
 * should not be used by clients.  This is the analogue of the PUC-Rio
 * type <code>Proto</code>, hence the name.
 * A function prototype represents the constant part of a function, that
 * is, a function without closures (upvalues) and without an
 * environment.  It's a handle for a block of VM instructions and
 * ancillary constants.
 *
 * For convenience some private arrays are exposed.  Modifying these
 * arrays is punishable by death. (Java has no convenient constant
 * array datatype)
 */
var Proto = function() {
    // Generally the fields are named following the PUC-Rio implementation
    // and so are unusually terse.
    /** Array of constants. */
    this._k = null; //Slot[] 
    this._sizek = 0;
    /** Array of VM instructions. */
    this._code = null; //int[] 
    this._sizecode = 0;
    /** Array of Proto objects. */
    this._p = null; //Proto[] 
    this._sizep = 0;
    /**
     * Number of upvalues used by this prototype (and so by all the
     * functions created from this Proto).
     */
    this._nups = 0;
    /**
     * Number of formal parameters used by this prototype, and so the
     * number of argument received by a function created from this Proto.
     * In a function defined to be variadic then this is the number of
     * fixed parameters, the number appearing before '...' in the parameter
     * list.
     */
    this._numparams = 0;
    /**
     * <code>true</code> if and only if the function is variadic, that is,
     * defined with '...' in its parameter list.
     */
    this._isVararg = false;
    this._maxstacksize = 0;
    // Debug info
    /** Map from PC to line number. */
    this._lineinfo = null; //int[]
    this._sizelineinfo = 0;
    this._locvars = null; //LocVar[] 
    this._sizelocvars = 0;
    this._upvalues = null; //String[] 
    this._sizeupvalues = 0; 
    this._source = null;
    this._linedefined = 0;
    this._lastlinedefined = 0; 
};

Proto.D = false; 

/** Interned 0-element array. */
Proto.ZERO_INT_ARRAY = new Array(); /*int[] = new int[0]*/
Proto.ZERO_LOCVAR_ARRAY = new Array(); /*LocVar[]  = new LocVar[0]*/
Proto.ZERO_CONSTANT_ARRAY = new Array();//final Slot[] ZERO_CONSTANT_ARRAY = new Slot[0];
Proto.ZERO_PROTO_ARRAY = new Array();//final Proto[] ZERO_PROTO_ARRAY = new Proto[0];
Proto.ZERO_STRING_ARRAY = new Array();//final String[] ZERO_STRING_ARRAY = new String[0];

/**
 * Proto synthesized by {@link Loader}.
 * All the arrays that are passed to the constructor are
 * referenced by the instance.  Avoid unintentional sharing.  All
 * arrays must be non-null and all int parameters must not be
 * negative.  Generally, this constructor is used by {@link Loader}
 * since that has all the relevant arrays already constructed (as
 * opposed to the compiler).
 * @param constant   array of constants.
 * @param code       array of VM instructions.
 * @param nups       number of upvalues (used by this function).
 * @param numparams  number of fixed formal parameters.
 * @param isVararg   whether '...' is used.
 * @param maxstacksize  number of stack slots required when invoking.
 * @throws NullPointerException if any array arguments are null.
 * @throws IllegalArgumentException if nups or numparams is negative.
 */
Proto.prototype.init1 = function(constant, //Slot[] 
    code, //int[] 
    proto, //Proto[] 
    nups,
    numparams,
    isVararg,
    maxstacksize) {
    if (null == constant || null == code || null == proto) {
        throw new NullPointerException();
    }
    if (nups < 0 || numparams < 0 || maxstacksize < 0) {
        throw new IllegalArgumentException();
    }
    this._k = constant; 
    this._sizek = this._k.length ;
    this._code = code;
    this._sizecode = this._code.length ;
    this._p = proto; 
    this._sizep = proto.length ;
    this._nups = nups;
    this._numparams = numparams;
    this.isVararg = isVararg;
    this._maxstacksize = maxstacksize;
};

/**
 * Blank Proto in preparation for compilation.
 * 废弃？
 */
Proto.prototype.init2 = function(source, maxstacksize) {
    this._maxstacksize = maxstacksize;
    // maxstacksize = 2;   // register 0/1 are always valid.
    // :todo: Consider removing size* members
    this._source = source;
    this._k = Proto.ZERO_CONSTANT_ARRAY;      
    this._sizek = 0 ;
    this._code = Proto.ZERO_INT_ARRAY;        
    this._sizecode = 0 ;
    this._p = Proto.ZERO_PROTO_ARRAY;         
    this._sizep = 0;
    this._lineinfo = Proto.ZERO_INT_ARRAY;    
    this._sizelineinfo = 0;
    this._locvars = Proto.ZERO_LOCVAR_ARRAY;  
    this._sizelocvars = 0 ;
    this._upvalues = Proto.ZERO_STRING_ARRAY; 
    this._sizeupvalues = 0;
};

/**
 * Augment with debug info.  All the arguments are referenced by the
 * instance after the method has returned, so try not to share them.
 */
Proto.prototype.debug = function(lineinfoArg, //int[] 
    locvarsArg, //LocVar[] 
    upvaluesArg) { //String[] 
    this._lineinfo = lineinfoArg;  
    this._sizelineinfo = this._lineinfo.length;
    this._locvars = locvarsArg;    
    this._sizelocvars = this._locvars.length;
    this._upvalues = upvaluesArg;  
    this._sizeupvalues = this._upvalues.length;
};

/** Gets source. */
Proto.prototype.getSource = function() {
    return this._source;
};

/** Setter for source. */
Proto.prototype.setSource = function(source) {
    this._source = source;
};

Proto.prototype.getLinedefined = function() {
    return this._linedefined;
};

Proto.prototype.setLinedefined = function(linedefined) {
    this._linedefined = linedefined;
};

Proto.prototype.getLastlinedefined = function() {
    return this._lastlinedefined;
};

Proto.prototype.setLastlinedefined = function(lastlinedefined) {
    this._lastlinedefined = lastlinedefined;
};

/** Gets Number of Upvalues */
Proto.prototype.getNups = function() {
    return this._nups;
};

Proto.prototype.setNups = function(nups) {
    this._nups = nups;
};

/** Number of Parameters. */
Proto.prototype.getNumparams = function() {
    return this._numparams;
};

Proto.prototype.setNumparams = function(numparams) {
    this._numparams = numparams;
};

/** Maximum Stack Size. */
Proto.prototype.getMaxstacksize = function() {
    return this._maxstacksize;
};

/** Setter for maximum stack size. */
Proto.prototype.setMaxstacksize = function(m) {
    this._maxstacksize = m;
};

/** Instruction block (do not modify). */
Proto.prototype.getCode = function() { //int[] 
    return this._code;
};

/** Append instruction. */
Proto.prototype.codeAppend = function(L, pc, instruction, line) {
    if (Proto.D) {
        console.log("pc:" + pc + 
            ", instruction:" + instruction + 
            ", line:" + line + 
            ", lineinfo.length:" + this.getLineinfo().length);
    }

    this.ensureCode(L, pc);
    this._code[pc] = instruction;

    if (pc >= this._lineinfo.length) {
        var newLineinfo = new Array(this._lineinfo.length * 2 + 1); //int[]
        SystemUtil.arraycopy(this._lineinfo, 0, newLineinfo, 0, this._lineinfo.length);
        this._lineinfo = newLineinfo;
    }
    this._lineinfo[pc] = line;
};

Proto.prototype.ensureLocvars = function(L, atleast, limit) {
    if (atleast + 1 > this._sizelocvars) {
        var newsize = atleast * 2 + 1 ;
        if (newsize > limit)
            newsize = limit ;
        if (atleast + 1 > newsize)
            L.gRunerror("too many local variables") ;
        var newlocvars = new Array(newsize); //LocVar []
        SystemUtil.arraycopy(this.getLocvars(), 0, newlocvars, 0, this._sizelocvars) ;
        for (var i = this._sizelocvars ; i < newsize ; i++)
            newlocvars[i] = new LocVar();
        this._locvars = newlocvars ;
        this._sizelocvars = newsize ;
    }
};

Proto.prototype.ensureProtos = function(L, atleast) {
    if (atleast + 1 > this._sizep) {
        var newsize = atleast * 2 + 1 ;
        if (newsize > Lua.MAXARG_Bx)
            newsize = Lua.MAXARG_Bx ;
        if (atleast + 1 > newsize)
            L.gRunerror("constant table overflow") ;
        var newprotos = new Array(newsize) ; //Proto [] 
        SystemUtil.arraycopy(this._p, 0, newprotos, 0, this._sizep) ;
        this._p = newprotos ;
        this._sizep = newsize ;
    }
};

Proto.prototype.ensureUpvals = function(L, atleast) {
    if (atleast + 1 > this._sizeupvalues) {
        var newsize = atleast * 2 + 1;
        if (atleast + 1 > newsize)
            L.gRunerror("upvalues overflow") ;
        var newupvalues = new Array(newsize); //String []
        SystemUtil.arraycopy(this._upvalues, 0, newupvalues, 0, this._sizeupvalues) ;
        this._upvalues = newupvalues ;
        this._sizeupvalues = newsize ;
    }
};

Proto.prototype.ensureCode = function(L, atleast) {
    if (atleast + 1 > this._sizecode) {
        var newsize = atleast * 2 + 1;
        if (atleast + 1 > newsize)
            L.gRunerror("code overflow") ;
        var newcode = new Array(newsize); //int [] 
        SystemUtil.arraycopy(this._code, 0, newcode, 0, this._sizecode) ;
        this._code = newcode ;
        this._sizecode = newsize ;
    }
};

/** Set lineinfo record. */
Proto.prototype.setLineinfo = function(pc, line) {
    this._lineinfo[pc] = line;
};

/** Get linenumber corresponding to pc, or 0 if no info. */
Proto.prototype.getline = function(pc) {
    if (this._lineinfo.length == 0) {
        return 0;
    }
    return this._lineinfo[pc];
};

/** Array of inner protos (do not modify). */
Proto.prototype.getProto = function() { //Proto[] 
    return this._p;
};

/** Constant array (do not modify). */
Proto.prototype.getConstant = function() { //Slot[] 
    return this._k;
};

/** Append constant. */
Proto.prototype.constantAppend = function(idx, o) {
    if (idx >= this._k.length) {
        var newK = new Array(this._k.length * 2 + 1); //Slot[]
        SystemUtil.arraycopy(this._k, 0, newK, 0, this._k.length);
        this._k = newK;
    }
    this._k[idx] = new Slot();
    (this._k[idx] as Slot).init2(o);
};

/** Predicate for whether function uses ... in its parameter list. */
Proto.prototype.getIsVararg = function() {
    return this._isVararg;
};

/** "Setter" for isVararg.  Sets it to true. */
Proto.prototype.setIsVararg = function(isVararg) {
    this._isVararg = true;
};

/** LocVar array (do not modify). */
Proto.prototype.getLocvars = function() { //LocVar[]
    return this._locvars;
};

// All the trim functions, below, check for the redundant case of
// trimming to the length that they already are.  Because they are
// initially allocated as interned zero-length arrays this also means
// that no unnecesary zero-length array objects are allocated.

/**
 * Trim an int array to specified size.
 * @return the trimmed array.
 */
Proto.prototype.trimInt = function(old/*int[] */, n) { //int[]
    if (n == old.length) {
        return old;
    }
    var newArray = new Array(n); //int[] 
    SystemUtil.arraycopy(old, 0, newArray, 0, n);
    return newArray;
};

/** Trim code array to specified size. */
Proto.prototype.closeCode = function(n) {
    this._code = this.trimInt(this._code, n);
    this._sizecode = this._code.length ;
};

/** Trim lineinfo array to specified size. */
Proto.prototype.closeLineinfo = function(n) {
    this._lineinfo = this.trimInt(this._lineinfo, n);
    this._sizelineinfo = n;
};

/** Trim k (constant) array to specified size. */
Proto.prototype.closeK = function(n) {
    if (this._k.length > n) {
        var newArray = new Array(n); //Slot[] 
        SystemUtil.arraycopy(this._k, 0, newArray, 0, n);
        this._k = newArray;
    }
    this._sizek = n;
    return;
};

/** Trim p (proto) array to specified size. */
Proto.prototype.closeP = function(n) {
    if (n == this._p.length) {
        return;
    }
    var newArray = new Array(n); //Proto[] 
    SystemUtil.arraycopy(this._p, 0, newArray, 0, n);
    this._p = newArray;
    this._sizep = n ;
};

/** Trim locvar array to specified size. */
Proto.prototype.closeLocvars = function(n) {
    if (n == this.getLocvars().length) {
        return;
    }
    var newArray = new Array(n); //LocVar[] 
    SystemUtil.arraycopy(this.getLocvars(), 0, newArray, 0, n);
    this._locvars = newArray;
    this._sizelocvars = n;
};

/** Trim upvalues array to size <var>nups</var>. */
Proto.prototype.closeUpvalues = function() {
    if (this.getNups() == this._upvalues.length) {
        return;
    }
    var newArray = new Array(this.getNups()); //String[] 
    SystemUtil.arraycopy(this._upvalues, 0, newArray, 0, this.getNups());
    this._upvalues = newArray;
    this._sizeupvalues = this.getNups();
};

//新增
Proto.prototype.getK = function() {
    return this._k;
};

//新增
Proto.prototype.getSizek = function() {
    return this._sizek;
};

//新增
Proto.prototype.getSizecode = function() {
    return this._sizecode;
};

//新增
Proto.prototype.getP = function() {
    return this._p;
};
//新增
Proto.prototype.getSizep = function() {
    return this._sizep;
};
//新增
Proto.prototype.getLineinfo = function() {
    return this._lineinfo;
};
//新增
Proto.prototype.getSizelineinfo = function() {
    return this._sizelineinfo;
};	
//新增
Proto.prototype.getSizelocvars = function() {
    return this._sizelocvars;
};
//新增
Proto.prototype.getUpvalues = function() {
    return this._upvalues;
};
//新增
Proto.prototype.getSizeupvalues = function() {
    return this._sizeupvalues;
};

if (typeof module !== 'undefined') {
    module.exports = Proto;
} else if (metamorphose) {
    metamorphose.Proto = Proto;
}
})(typeof window !== 'undefined' && window.metamorphose);
