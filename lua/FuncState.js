;(function(metamorphose) {
var Hashtable = metamorphose ? metamorphose.Hashtable : require('../java/Hashtable.js');

var Proto = metamorphose ? metamorphose.Proto : require('./Proto.js');
var Expdesc = metamorphose ? metamorphose.Expdesc : require('./Expdesc.js');
var Syntax = metamorphose ? metamorphose.Syntax : require('./Syntax.js');
//var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/FuncState.java#1 $
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
 * Used to model a function during compilation.  Code generation uses
 * this structure extensively.  Most of the PUC-Rio functions from
 * lcode.c have moved into this class, alongwith a few functions from
 * lparser.c
 */
/**
 * Constructor.  Much of this is taken from <code>open_func</code> in
 * <code>lparser.c</code>.
 */
var FuncState = function(ls) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');

    /** Proto object for this function. */
    this._f = null;

    /**
    * Table to find (and reuse) elements in <var>f.k</var>.  Maps from
    * Object (a constant Lua value) to an index into <var>f.k</var>.
    */
    this._h = new Hashtable();

    /** Enclosing function. */
    this._prev = null;

    /** Lexical state. */
    this._ls = null;

    /** Lua state. */
    this._L = null;

    /** chain of current blocks */
    this._bl = null;  // = null;

    /** next position to code. */
    this._pc = 0;       // = 0;

    /** pc of last jump target. */
    this._lasttarget = -1;

    /** List of pending jumps to <var>pc</var>. */
    this._jpc = FuncState.NO_JUMP;

    /** First free register. */
    this._freereg = 0;  // = 0;

    /** number of elements in <var>k</var>. */
    this._nk = 0;       // = 0;

    /** number of elements in <var>p</var>. */
    this._np = 0;       // = 0;

    /** number of elements in <var>locvars</var>. */
    this._nlocvars = 0;       // = 0;

    /** number of active local variables. */
    this._nactvar = 0;        // = 0;

    /** upvalues as 8-bit k and 8-bit info */
    this._upvalues = new Array(Lua.MAXUPVALUES); //int [] 

    /** declared-variable stack. */
    this._actvar = new Array(Lua.MAXVARS); //short[] 

    this._f = new Proto();
    this._f.init2(ls.source, 2); // default value for maxstacksize=2
    this._L = ls.L ;
    this._ls = ls;
    //    prev = ls.linkfs(this);
};

/** See NO_JUMP in lcode.h. */
FuncState.NO_JUMP = -1;

/** Equivalent to <code>close_func</code> from <code>lparser.c</code>. */
FuncState.prototype.close = function() {
    this._f.closeCode(this._pc);
    this._f.closeLineinfo(this._pc);
    this._f.closeK(this._nk);
    this._f.closeP(this._np);
    this._f.closeLocvars(this._nlocvars);
    this._f.closeUpvalues();
    var checks = this._L.gCheckcode(this._f);
    //# assert checks
    //# assert bl == null
};

/** Equivalent to getlocvar from lparser.c.
* Accesses <code>LocVar</code>s of the {@link Proto}.
*/
FuncState.prototype.getlocvar = function(idx) {
    return this._f.locvars[this._actvar[idx]];
};

// Functions from lcode.c

/** Equivalent to luaK_checkstack. */
FuncState.prototype.kCheckstack = function(n) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var newstack = this._freereg + n;
    if (newstack > this._f.getMaxstacksize()) {
        if (newstack >= Lua.MAXSTACK) {
            this._ls.xSyntaxerror("function or expression too complex");
        }
        this._f.setMaxstacksize(newstack);
    }
};

/** Equivalent to luaK_code. */
FuncState.prototype.kCode = function(i, line) {
    this.dischargejpc();
    // Put new instruction in code array.
    this._f.codeAppend(this._L, this._pc, i, line);
    return this._pc++;
};

/** Equivalent to luaK_codeABC. */
FuncState.prototype.kCodeABC = function(o, a, b, c) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    // assert getOpMode(o) == iABC;
    // assert getBMode(o) != OP_ARG_N || b == 0;
    // assert getCMode(o) != OP_ARG_N || c == 0;
    return this.kCode(Lua.CREATE_ABC(o, a, b, c), this._ls.lastline);
};

/** Equivalent to luaK_codeABx. */
FuncState.prototype.kCodeABx = function(o, a, bc) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    // assert getOpMode(o) == iABx || getOpMode(o) == iAsBx);
    // assert getCMode(o) == OP_ARG_N);
    return this.kCode(Lua.CREATE_ABx(o, a, bc), this._ls.lastline);
};

/** Equivalent to luaK_codeAsBx. */
FuncState.prototype.kCodeAsBx = function(o, a, bc) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    return this.kCodeABx(o, a, bc+Lua.MAXARG_sBx);
};

/** Equivalent to luaK_dischargevars. */
FuncState.prototype.kDischargevars = function(e) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    switch (e.getKind()) {
    case Expdesc.VLOCAL:
        e.setKind(Expdesc.VNONRELOC);
        break;

    case Expdesc.VUPVAL:
        e.reloc(this.kCodeABC(Lua.OP_GETUPVAL, 0, e.getInfo(), 0));
        break;

    case Expdesc.VGLOBAL:
        e.reloc(this.kCodeABx(Lua.OP_GETGLOBAL, 0, e.getInfo()));
        break;

    case Expdesc.VINDEXED:
        this.__freereg(e.getAux()); //TODO:
        this.__freereg(e.getInfo()); //TODO:
        e.reloc(this.kCodeABC(Lua.OP_GETTABLE, 0, e.getInfo(), e.getAux()));
        break;

    case Expdesc.VVARARG:
    case Expdesc.VCALL:
        this.kSetoneret(e);
        break;

    default:
        break;  // there is one value available (somewhere)
    }
};

/** Equivalent to luaK_exp2anyreg. */
FuncState.prototype.kExp2anyreg = function(e) {
    this.kDischargevars(e);
    if (e.getK() == Expdesc.VNONRELOC) {
        if (!e.hasjumps()) {
            return e.getInfo();
        }
        if (e.getInfo() >= this._nactvar) {         // reg is not a local?
            this.exp2reg(e, e.getInfo());   // put value on it
            return e.getInfo();
        }
    }
    this.kExp2nextreg(e);    // default
    return e.getInfo();
};

/** Equivalent to luaK_exp2nextreg. */
FuncState.prototype.kExp2nextreg = function(e) {
    this.kDischargevars(e);
    this.freeexp(e);
    this.kReserveregs(1);
    this.exp2reg(e, this._freereg - 1);
};

/** Equivalent to luaK_fixline. */
FuncState.prototype.kFixline = function(line) {
    this._f.setLineinfo(this._pc - 1, line);
};

/** Equivalent to luaK_infix. */
FuncState.prototype.kInfix = function(op, v) {
    switch (op) {
    case Syntax.OPR_AND:
        this.kGoiftrue(v);
        break;

    case Syntax.OPR_OR:
        this.kGoiffalse(v);
        break;

    case Syntax.OPR_CONCAT:
        this.kExp2nextreg(v);  /* operand must be on the `stack' */
        break;

    default:
        if (!this.isnumeral(v))
            this.kExp2RK(v);
        break;
    }
};

FuncState.prototype.isnumeral = function(e) {
    return e.getK() == Expdesc.VKNUM &&
        e.getT() == FuncState.NO_JUMP &&
        e.getF() == FuncState.NO_JUMP;
};

/** Equivalent to luaK_nil. */
FuncState.prototype.kNil = function(from, n) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var previous;
    if (this._pc > this._lasttarget) {  /* no jumps to current position? */
        if (this._pc == 0)  /* function start? */
            return;  /* positions are already clean */
        previous = this._pc - 1;
        var instr = this._f.code[previous] ;
        if (Lua.OPCODE(instr) == Lua.OP_LOADNIL) {
            var pfrom = Lua.ARGA(instr);
            var pto = Lua.ARGB(instr);
            if (pfrom <= from && from <= pto+1) { /* can connect both? */ 
                if (from + n - 1 > pto)
                    this._f.code[previous] = Lua.SETARG_B(instr, from+n-1);
                return;
            }
        }
    }
    this.kCodeABC(Lua.OP_LOADNIL, from, from + n - 1, 0);
};

/** Equivalent to luaK_numberK. */
FuncState.prototype.kNumberK = function(r) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    return this.addk(Lua.valueOfNumber(r)); //TODO:L->Lua
};

/** Equivalent to luaK_posfix. */
FuncState.prototype.kPosfix = function(op, e1, e2) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    switch (op) {
    case Syntax.OPR_AND:
        /* list must be closed */
        //# assert e1.t == FuncState.NO_JUMP
        this.kDischargevars(e2);
        e2.setF(this.kConcat(e2.getF(), e1.getF()));
        e1.copy(e2); //TODO:
        break;

    case Syntax.OPR_OR:
        /* list must be closed */
        //# assert e1.f == FuncState.NO_JUMP
        this.kDischargevars(e2);
        e2.setT(this.kConcat(e2.getT(), e1.getT()));
        e1.copy(e2); //TODO:
        break;

    case Syntax.OPR_CONCAT:
        this.kExp2val(e2);
        if (e2.getK() == Expdesc.VRELOCABLE && Lua.OPCODE(this.getcode(e2)) == Lua.OP_CONCAT) {
            //# assert e1.info == Lua.ARGB(getcode(e2))-1
            this.freeexp(e1);
            this.setcode(e2, Lua.SETARG_B(this.getcode(e2), e1.getInfo()));
            e1.setK(e2.getK());
            e1.setInfo(e2.getInfo());
        } else {
            this.kExp2nextreg(e2);  /* operand must be on the 'stack' */
            this.codearith(Lua.OP_CONCAT, e1, e2);
        }
        break;

    case Syntax.OPR_ADD: 
        this.codearith(Lua.OP_ADD, e1, e2); 
        break;

    case Syntax.OPR_SUB: 
        this.codearith(Lua.OP_SUB, e1, e2); 
        break;

    case Syntax.OPR_MUL: 
        this.codearith(Lua.OP_MUL, e1, e2); 
        break;

    case Syntax.OPR_DIV: 
        this.codearith(Lua.OP_DIV, e1, e2); 
        break;

    case Syntax.OPR_MOD: 
        this.codearith(Lua.OP_MOD, e1, e2); 
        break;

    case Syntax.OPR_POW: 
        this.codearith(Lua.OP_POW, e1, e2); 
        break;

    case Syntax.OPR_EQ: 
        this.codecomp(Lua.OP_EQ, true,  e1, e2); 
        break;

    case Syntax.OPR_NE: 
        this.codecomp(Lua.OP_EQ, false, e1, e2); 
        break;

    case Syntax.OPR_LT: 
        this.codecomp(Lua.OP_LT, true,  e1, e2); 
        break;

    case Syntax.OPR_LE: 
        this.codecomp(Lua.OP_LE, true,  e1, e2); 
        break;

    case Syntax.OPR_GT: 
        this.codecomp(Lua.OP_LT, false, e1, e2); 
        break;

    case Syntax.OPR_GE: 
        this.codecomp(Lua.OP_LE, false, e1, e2); 
        break;

    default:
        //# assert false
    }
};

/** Equivalent to luaK_prefix. */
FuncState.prototype.kPrefix = function(op, e) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var e2 = new Expdesc();// TODO:
    e2.init(Expdesc.VKNUM, 0);
    switch (op) {
    case Syntax.OPR_MINUS:
        if (e.getKind() == Expdesc.VK) {
            this.kExp2anyreg(e);
        }
        this.codearith(Lua.OP_UNM, e, e2);
        break;

    case Syntax.OPR_NOT:
        this.codenot(e);
        break;

    case Syntax.OPR_LEN:
        this.kExp2anyreg(e);
        this.codearith(Lua.OP_LEN, e, e2);
        break;

    default:
        throw new Error("IllegalArgumentException");
    }
};

/** Equivalent to luaK_reserveregs. */
FuncState.prototype.kReserveregs = function(n) {
    this.kCheckstack(n);
    this._freereg += n;
};

/** Equivalent to luaK_ret. */
FuncState.prototype.kRet = function(first, nret) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    this.kCodeABC(Lua.OP_RETURN, first, nret+1, 0);
};

/** Equivalent to luaK_setmultret (in lcode.h). */
FuncState.prototype.kSetmultret = function(e) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    this.kSetreturns(e, Lua.MULTRET);
};

/** Equivalent to luaK_setoneret. */
FuncState.prototype.kSetoneret = function(e) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    if (e.getKind() == Expdesc.VCALL) {     // expression is an open function call?
        e.nonreloc(Lua.ARGA(this.getcode(e)));
    } else if (e.getKind() == Expdesc.VVARARG) {
        this.setargb(e, 2);
        e.setKind(Expdesc.VRELOCABLE);
    }
};

/** Equivalent to luaK_setreturns. */
FuncState.prototype.kSetreturns = function(e, nresults) {
    if (e.getKind() == Expdesc.VCALL) {     // expression is an open function call?
        this.setargc(e, nresults + 1);
    } else if (e.getKind() == Expdesc.VVARARG) {
        this.setargb(e, nresults + 1);
        this.setarga(e, this._freereg);
        this.kReserveregs(1);
    }
};

/** Equivalent to luaK_stringK. */
FuncState.prototype.kStringK = function(s) {
    return this.addk(s/*.intern()*/);
};

FuncState.prototype.addk = function(o) {
    var hash = o;
    var v = this._h._get(hash); //TODO:get
    if (v != null) {
        // :todo: assert
        return v; //TODO:
    }
    // constant not found; create a new entry
    this._f.constantAppend(this._nk, o);
    this._h.put(hash, parseInt(this._nk)); //TODO:new int
    return this._nk++;
};

FuncState.prototype.codearith = function(op, e1, e2) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    if (this.constfolding(op, e1, e2)) {
        return;
    } else {
        var o1 = this.kExp2RK(e1);
        var o2 = (op != Lua.OP_UNM && op != Lua.OP_LEN) ? this.kExp2RK(e2) : 0;
        this.freeexp(e2);
        this.freeexp(e1);
        e1.setInfo(this.kCodeABC(op, 0, o1, o2));
        e1.setK(Expdesc.VRELOCABLE);
    }
};

FuncState.prototype.constfolding = function(op, e1, e2) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var r = 0;
    if (!this.isnumeral(e1) || !this.isnumeral(e2))
        return false;

    var v1 = e1.getNval();
    var v2 = e2.getNval();
    switch (op) {
    case Lua.OP_ADD: 
        r = v1 + v2; 
        break;

    case Lua.OP_SUB: 
        r = v1 - v2; 
        break;

    case Lua.OP_MUL: 
        r = v1 * v2; 
        break;

    case Lua.OP_DIV:
        if (v2 == 0.0)
            return false;  /* do not attempt to divide by 0 */
        r = v1 / v2;
        break;

    case Lua.OP_MOD:
        if (v2 == 0.0)
            return false;  /* do not attempt to divide by 0 */
        r = v1 % v2;
        break;

    case Lua.OP_POW: 
        r = Lua.iNumpow(v1, v2);  //TODO:L->Lua
        break;

    case Lua.OP_UNM: 
        r = -v1; 
        break;

    case Lua.OP_LEN: 
        return false;  /* no constant folding for 'len' */

    default:
        //# assert false
        r = 0.0; 
        break;
    }
    if (isNaN(r))
        return false;  /* do not attempt to produce NaN */
    e1.setNval(r);
    return true;
};

FuncState.prototype.codenot = function(e) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    this.kDischargevars(e);
    switch (e.getK()) {
    case Expdesc.VNIL:
    case Expdesc.VFALSE:
        e.setK(Expdesc.VTRUE);
        break;

    case Expdesc.VK:
    case Expdesc.VKNUM:
    case Expdesc.VTRUE:
        e.setK(Expdesc.VFALSE);
        break;

    case Expdesc.VJMP:
        this.invertjump(e);
        break;

    case Expdesc.VRELOCABLE:
    case Expdesc.VNONRELOC:
        this.discharge2anyreg(e);
        this.freeexp(e);
        e.setInfo(this.kCodeABC(Lua.OP_NOT, 0, e.getInfo(), 0));
        e.setK(Expdesc.VRELOCABLE);
        break;

    default:
        //# assert false
        break;
    }
    /* interchange true and false lists */
    { 
        var temp = e.getF(); 
        e.setF(e.getT()); 
        e.setT(temp); 
    }
    this.removevalues(e.getF());
    this.removevalues(e.getT());
};

FuncState.prototype.removevalues = function(list) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    for (; list != FuncState.NO_JUMP; list = this.getjump(list))
        this.patchtestreg(list, Lua.NO_REG);
};

FuncState.prototype.dischargejpc = function() {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    this.patchlistaux(this._jpc, this._pc, Lua.NO_REG, this._pc);
    this._jpc = FuncState.NO_JUMP;
};

FuncState.prototype.discharge2reg = function(e, reg) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    this.kDischargevars(e);
    switch (e.getK()) {
    case Expdesc.VNIL:
        this.kNil(reg, 1);
        break;

    case Expdesc.VFALSE:
    case Expdesc.VTRUE:
        this.kCodeABC(Lua.OP_LOADBOOL, reg, (e.getK() == Expdesc.VTRUE ? 1 : 0), 0);
        break;

    case Expdesc.VK:
        this.kCodeABx(Lua.OP_LOADK, reg, e.getInfo());
        break;

    case Expdesc.VKNUM:
        this.kCodeABx(Lua.OP_LOADK, reg, this.kNumberK(e.getNval()));
        break;

    case Expdesc.VRELOCABLE:
        this.setarga(e, reg);
        break;

    case Expdesc.VNONRELOC:
        if (reg != e.getInfo()) {
            this.kCodeABC(Lua.OP_MOVE, reg, e.getInfo(), 0);
        }
        break;

    case Expdesc.VVOID:
    case Expdesc.VJMP:
        return;

    default:
        //# assert false
    }
    e.nonreloc(reg);
};

FuncState.prototype.exp2reg = function(e, reg) {
    this.discharge2reg(e, reg);
    if (e.getK() == Expdesc.VJMP) {
        e.setT(this.kConcat(e.getT(), e.getInfo()));  /* put this jump in `t' list */
    }
    if (e.hasjumps()) {
        var p_f = FuncState.NO_JUMP;  /* position of an eventual LOAD false */
        var p_t = FuncState.NO_JUMP;  /* position of an eventual LOAD true */
        if (this.need_value(e.getT()) || this.need_value(e.getF())) {
            var fj = (e.getK() == Expdesc.VJMP) ? FuncState.NO_JUMP : this.kJump();
            p_f = this.code_label(reg, 0, 1);
            p_t = this.code_label(reg, 1, 0);
            this.kPatchtohere(fj);
        }
        var finalpos = this.kGetlabel(); /* position after whole expression */
        this.patchlistaux(e.getF(), finalpos, reg, p_f);
        this.patchlistaux(e.getT(), finalpos, reg, p_t);
    }
    e.init(Expdesc.VNONRELOC, reg);
};

FuncState.prototype.code_label = function(a, b, jump) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    this.kGetlabel();  /* those instructions may be jump targets */
    return this.kCodeABC(Lua.OP_LOADBOOL, a, b, jump);
};

/**
 * check whether list has any jump that do not produce a value
 * (or produce an inverted value)
 */
FuncState.prototype.need_value = function(list) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    for (; list != FuncState.NO_JUMP; list = this.getjump(list)) {
        var i = this.getjumpcontrol(list);
        var instr = this._f.code[i] ;
        if (Lua.OPCODE(instr) != Lua.OP_TESTSET)
            return true;
    }
    return false;  /* not found */
};

FuncState.prototype.freeexp = function(e) {
    if (e.getKind() == Expdesc.VNONRELOC) {
        this.__freereg(e.getInfo());
    }
};

FuncState.prototype.setFreereg = function(freereg) {
    this._freereg = freereg;
};

FuncState.prototype.getFreereg = function() {
    return this._freereg;
};

FuncState.prototype.__freereg = function(reg) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    if (!Lua.ISK(reg) && reg >= this._nactvar) {
        --this._freereg;
        // assert reg == freereg;
    }
};

FuncState.prototype.getcode = function(e) {
    return this._f.code[e.getInfo()];
};

FuncState.prototype.setcode = function(e, code) {
    this._f.code[e.getInfo()] = code;
};

/** Equivalent to searchvar from lparser.c */
FuncState.prototype.searchvar = function(n) {
    // caution: descending loop (in emulation of PUC-Rio).
    for (var i = this._nactvar - 1; i >= 0; i--) {
        if (n == this.getlocvar(i).varname)
            return i;
    }
    return -1;  // not found
};

FuncState.prototype.setarga = function(e, a) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var at = e.getInfo();
    var code = this._f.code; //int[] 
    code[at] = Lua.SETARG_A(code[at], a);
};

FuncState.prototype.setargb = function(e, b) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var at = e.getInfo();
    var code = this._f.code; //int[] 
    code[at] = Lua.SETARG_B(code[at], b);
};

FuncState.prototype.setargc = function(e, c) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var at = e.getInfo();
    var code = this._f.code; //int[]
    code[at] = Lua.SETARG_C(code[at], c);
};

/** Equivalent to <code>luaK_getlabel</code>. */
FuncState.prototype.kGetlabel = function() {
    this._lasttarget = this._pc ;
    return this._pc;
};

/**
* Equivalent to <code>luaK_concat</code>.
* l1 was an int*, now passing back as result.
*/
FuncState.prototype.kConcat = function(l1, l2) {
    if (l2 == FuncState.NO_JUMP)
        return l1;
    else if (l1 == FuncState.NO_JUMP)
        return l2;
    else {
        var list = l1;
        var next;
        while ((next = this.getjump(list)) != FuncState.NO_JUMP)  /* find last element */
            list = next;
        this.fixjump(list, l2);
        return l1;
    }
};

/** Equivalent to <code>luaK_patchlist</code>. */
FuncState.prototype.kPatchlist = function(list, target) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    if (target == this._pc)
        this.kPatchtohere(list);
    else {
        //# assert target < pc
        this.patchlistaux(list, target, Lua.NO_REG, target);
    }
};

FuncState.prototype.patchlistaux = function(list, vtarget, reg,
                        dtarget) {
    while (list != FuncState.NO_JUMP) {
        var next = this.getjump(list);
        if (this.patchtestreg(list, reg))
            this.fixjump(list, vtarget);
        else
            this.fixjump(list, dtarget);  /* jump to default target */
        list = next;
    }
};

FuncState.prototype.patchtestreg = function(node, reg) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var i = this.getjumpcontrol(node);
    var code = this._f.code; //int [] 
    var instr = code[i] ;
    if (Lua.OPCODE(instr) != Lua.OP_TESTSET)
        return false;  /* cannot patch other instructions */
    if (reg != Lua.NO_REG && reg != Lua.ARGB(instr))
        code[i] = Lua.SETARG_A(instr, reg);
    else  /* no register to put value or register already has the value */
        code[i] = Lua.CREATE_ABC(Lua.OP_TEST, Lua.ARGB(instr), 0, Lua.ARGC(instr));

    return true;
};

FuncState.prototype.getjumpcontrol = function(at) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var code = this._f.code; //int []
    if (at >= 1 && this.testTMode(Lua.OPCODE(code[at-1])))
        return at - 1;
    else
        return at;
};

/*
** masks for instruction properties. The format is:
** bits 0-1: op mode
** bits 2-3: C arg mode
** bits 4-5: B arg mode
** bit 6: instruction set register A
** bit 7: operator is a test
*/

/** arg modes */
FuncState.OP_ARG_N = 0;
FuncState.OP_ARG_U = 1;
FuncState.OP_ARG_R = 2;
FuncState.OP_ARG_K = 3;

/** op modes */
FuncState.iABC = 0;
FuncState.iABx = 1;
FuncState.iAsBx = 2;

FuncState.opmode = function(t, a, b, c, m) {
    return ((t << 7) | (a << 6) | (b << 4) | (c << 2) | m);
};

FuncState.OPMODE = [ //new byte []
    /*      T  A  B         C         mode                opcode  */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_MOVE */
    FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx),            /* OP_LOADK */
    FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC),            /* OP_LOADBOOL */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_LOADNIL */
    FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_GETUPVAL */
    FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx),            /* OP_GETGLOBAL */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_GETTABLE */
    FuncState.opmode(0, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx),            /* OP_SETGLOBAL */
    FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_SETUPVAL */
    FuncState.opmode(0, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_SETTABLE */
    FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC),            /* OP_NEWTABLE */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_SELF */
    FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_ADD */
    FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_SUB */
    FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_MUL */
    FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_DIV */
    FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_MOD */
    FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_POW */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_UNM */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_NOT */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_LEN */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_R, FuncState.iABC),            /* OP_CONCAT */
    FuncState.opmode(0, 0, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx),           /* OP_JMP */
    FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_EQ */
    FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_LT */
    FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC),            /* OP_LE */
    FuncState.opmode(1, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_U, FuncState.iABC),            /* OP_TEST */
    FuncState.opmode(1, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_U, FuncState.iABC),            /* OP_TESTSET */
    FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC),            /* OP_CALL */
    FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC),            /* OP_TAILCALL */
    FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_RETURN */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx),           /* OP_FORLOOP */
    FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx),           /* OP_FORPREP */
    FuncState.opmode(1, 0, FuncState.OP_ARG_N, FuncState.OP_ARG_U, FuncState.iABC),            /* OP_TFORLOOP */
    FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC),            /* OP_SETLIST */
    FuncState.opmode(0, 0, FuncState.OP_ARG_N, FuncState.OP_ARG_N, FuncState.iABC),            /* OP_CLOSE */
    FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABx),            /* OP_CLOSURE */
    FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_VARARG */
];

FuncState.prototype.getOpMode = function(m) {
    return FuncState.OPMODE[m] & 3 ;
};

FuncState.prototype.testAMode = function(m) {
    return (FuncState.OPMODE[m] & (1<<6)) != 0 ;
};

FuncState.prototype.testTMode = function(m) {
    return (FuncState.OPMODE[m] & (1<<7)) != 0 ;
};

/** Equivalent to <code>luaK_patchtohere</code>. */
FuncState.prototype.kPatchtohere = function(list) {
    this.kGetlabel();
    this._jpc = this.kConcat(this._jpc, list);
};

FuncState.prototype.fixjump = function(at, dest) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var jmp = this._f.code[at];
    var offset = dest - (at + 1);
    //# assert dest != FuncState.NO_JUMP
    if (Math.abs(offset) > Lua.MAXARG_sBx)
        this._ls.xSyntaxerror("control structure too long");
    this._f.code[at] = Lua.SETARG_sBx(jmp, offset);
};

FuncState.prototype.getjump = function(at) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var offset = Lua.ARGsBx(this._f.code[at]);
    if (offset == FuncState.NO_JUMP)  /* point to itself represents end of list */
        return FuncState.NO_JUMP;  /* end of list */
    else
        return (at+1)+offset;  /* turn offset into absolute position */
};

/** Equivalent to <code>luaK_jump</code>. */
FuncState.prototype.kJump = function() {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var old_jpc = this._jpc;  /* save list of jumps to here */
    this._jpc = FuncState.NO_JUMP;
    var j = this.kCodeAsBx(Lua.OP_JMP, 0, FuncState.NO_JUMP);
    j = this.kConcat(j, old_jpc);  /* keep them on hold */
    return j;
};

/** Equivalent to <code>luaK_storevar</code>. */
FuncState.prototype.kStorevar = function(_var, ex) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    switch (_var.getK()) {
    case Expdesc.VLOCAL:
        {
            this.freeexp(ex);
            this.exp2reg(ex, _var.getInfo());
            return;
        }

    case Expdesc.VUPVAL:
        {
            var e = this.kExp2anyreg(ex);
            this.kCodeABC(Lua.OP_SETUPVAL, e, _var.getInfo(), 0);
            break;
        }

    case Expdesc.VGLOBAL:
        {
            var e2 = this.kExp2anyreg(ex);
            this.kCodeABx(Lua.OP_SETGLOBAL, e2, _var.getInfo());
            break;
        }

    case Expdesc.VINDEXED:
        {
            var e3 = this.kExp2RK(ex);
            this.kCodeABC(Lua.OP_SETTABLE, _var.getInfo(), _var.getAux(), e3);
            break;
        }

    default:
        {
            /* invalid var kind to store */
            //# assert false
            break;
        }
    }
    this.freeexp(ex);
};

/** Equivalent to <code>luaK_indexed</code>. */
FuncState.prototype.kIndexed = function(t, k) {
    t.setAux(this.kExp2RK(k));
    t.setK(Expdesc.VINDEXED);
};

/** Equivalent to <code>luaK_exp2RK</code>. */
FuncState.prototype.kExp2RK = function(e) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    this.kExp2val(e);
    switch (e.getK()) {
    case Expdesc.VKNUM:
    case Expdesc.VTRUE:
    case Expdesc.VFALSE:
    case Expdesc.VNIL:
        if (this._nk <= Lua.MAXINDEXRK) {   /* constant fit in RK operand? */
            e.setInfo((e.getK() == Expdesc.VNIL) ? this.nilK() :
                (e.getK() == Expdesc.VKNUM) ? this.kNumberK(e.getNval()) :
                this.boolK(e.getK() == Expdesc.VTRUE));
            e.setK(Expdesc.VK);
            return e.getInfo() | Lua.BITRK;
        } else { 
            break;
        }

    case Expdesc.VK:
        if (e.getInfo() <= Lua.MAXINDEXRK) { /* constant fit in argC? */
            return e.getInfo() | Lua.BITRK;
        } else {
            break;
        }

    default: 
        break;
    }
    /* not a constant in the right range: put it in a register */
    return this.kExp2anyreg(e);
};

/** Equivalent to <code>luaK_exp2val</code>. */
FuncState.prototype.kExp2val = function(e) {
    if (e.hasjumps())
        this.kExp2anyreg(e);
    else
        this.kDischargevars(e);
};

FuncState.prototype.boolK = function(b) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    return this.addk(Lua.valueOfBoolean(b));
};

FuncState.prototype.nilK = function() {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    return this.addk(Lua.NIL);
};

/** Equivalent to <code>luaK_goiffalse</code>. */
FuncState.prototype.kGoiffalse = function(e) {
    var lj;  /* pc of last jump */
    this.kDischargevars(e);
    switch (e.getK()) {
    case Expdesc.VNIL:
    case Expdesc.VFALSE:
        lj = FuncState.NO_JUMP;  /* always false; do nothing */
        break;

    case Expdesc.VTRUE:
        lj = this.kJump();  /* always jump */
        break;

    case Expdesc.VJMP:
        lj = e.getInfo();
        break;

    default:
        lj = this.jumponcond(e, true);
        break;
    }
    e.setT(this.kConcat(e.getT(), lj));  /* insert last jump in `t' list */
    this.kPatchtohere(e.getF());
    e.setF(FuncState.NO_JUMP);
};

/** Equivalent to <code>luaK_goiftrue</code>. */
FuncState.prototype.kGoiftrue = function(e) {
    var lj;  /* pc of last jump */
    this.kDischargevars(e);
    switch (e.getK()) {
    case Expdesc.VK:
    case Expdesc.VKNUM:
    case Expdesc.VTRUE:
        lj = FuncState.NO_JUMP;  /* always true; do nothing */
        break;

    case Expdesc.VFALSE:
        lj = this.kJump();  /* always jump */
        break;

    case Expdesc.VJMP:
        this.invertjump(e);
        lj = e.getInfo();
        break;

    default:
        lj = this.jumponcond(e, false);
        break;
    }
    e.setF(this.kConcat(e.getF(), lj));  /* insert last jump in `f' list */
    this.kPatchtohere(e.getT());
    e.setT(FuncState.NO_JUMP);
};

FuncState.prototype.invertjump = function(e) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var at = this.getjumpcontrol(e.getInfo());
    var code = this._f.code; //int []
    var instr = code[at];
    //# assert testTMode(Lua.OPCODE(instr)) && Lua.OPCODE(instr) != Lua.OP_TESTSET && Lua.OPCODE(instr) != Lua.OP_TEST
    code[at] = Lua.SETARG_A(instr, (Lua.ARGA(instr) == 0 ? 1 : 0));
};

FuncState.prototype.jumponcond = function(e, cond) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    if (e.getK() == Expdesc.VRELOCABLE) {
        var ie = this.getcode(e);
        if (Lua.OPCODE(ie) == Lua.OP_NOT) {
            this._pc--;  /* remove previous OP_NOT */
            return this.condjump(Lua.OP_TEST, Lua.ARGB(ie), 0, cond ? 0 : 1);
      }
      /* else go through */
    }
    this.discharge2anyreg(e);
    this.freeexp(e);
    return this.condjump(Lua.OP_TESTSET, Lua.NO_REG, e.getInfo(), cond ? 1 : 0);
};

FuncState.prototype.condjump = function(op, a, b, c) {
    this.kCodeABC(op, a, b, c);
    return this.kJump();
};

FuncState.prototype.discharge2anyreg = function(e) {
    if (e.getK() != Expdesc.VNONRELOC) {
        this.kReserveregs(1);
        this.discharge2reg(e, this._freereg - 1);
    }
};

FuncState.prototype.kSelf = function(e, key) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    this.kExp2anyreg(e);
    this.freeexp(e);
    var func = this._freereg;
    this.kReserveregs(2);
    this.kCodeABC(Lua.OP_SELF, func, e.getInfo(), this.kExp2RK(key));
    this.freeexp(key);
    e.setInfo(func);
    e.setK(Expdesc.VNONRELOC);
};

FuncState.prototype.kSetlist = function(base, nelems, tostore) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var c = (nelems - 1) / Lua.LFIELDS_PER_FLUSH + 1;
    var b = (tostore == Lua.MULTRET) ? 0 : tostore;
    //# assert tostore != 0
    if (c <= Lua.MAXARG_C)
        this.kCodeABC(Lua.OP_SETLIST, base, b, c);
    else {
        this.kCodeABC(Lua.OP_SETLIST, base, b, 0);
        this.kCode(c, this._ls.lastline);
    }
    this._freereg = base + 1;  /* free registers with list values */
};

FuncState.prototype.codecomp = function(op, cond, e1, e2) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var o1 = this.kExp2RK(e1);
    var o2 = this.kExp2RK(e2);
    this.freeexp(e2);
    this.freeexp(e1);
    if ((!cond) && op != Lua.OP_EQ) {
        /* exchange args to replace by `<' or `<=' */
        var temp = o1; 
        o1 = o2; 
        o2 = temp;  /* o1 <==> o2 */
        cond = true;
    }
    e1.setInfo(this.condjump(op, (cond ? 1 : 0), o1, o2));
    e1.setK(Expdesc.VJMP);
};

FuncState.prototype.markupval = function(level) {
    var b = this.getBl();
    while (b != null && b.nactvar > level)
        b = b.previous;
    if (b != null)
        b.upval = true;
};

//新增
FuncState.prototype.getF = function() {
    return this._f;
};

//新增
FuncState.prototype.setF = function(f) {
    this._f = f;
};

//新增
FuncState.prototype.getPrev = function() {
    return this._prev;
};

//新增
FuncState.prototype.setPrev = function(prev) {
    this._prev = prev;
};

//新增
FuncState.prototype.setLs = function(ls) {
    this._ls = ls;
};

//新增
FuncState.prototype.setL = function(L) {
    this._L = L;
};

//新增
FuncState.prototype.getBl = function() {
    return this._bl;
};

//新增
FuncState.prototype.setBl = function(bl) {
    this._bl = bl;
};

//新增
FuncState.prototype.getPc = function() {
    return this._pc;
};

//新增
FuncState.prototype.getNp = function() {
    return this._np;
};

//新增
FuncState.prototype.setNp = function(np) {
    this._np = np;
};

//新增
FuncState.prototype.getNlocvars = function() {
    return this._nlocvars;
};

//新增
FuncState.prototype.setNlocvars = function(nlocvars) {
    this._nlocvars = nlocvars;
};

//新增
FuncState.prototype.getNactvar = function() {
    return this._nactvar;
};

//新增
FuncState.prototype.setNactvar = function(nactvar) {
    this._nactvar = nactvar;
};

//新增
FuncState.prototype.getUpvalues = function() {
    return this._upvalues;
};

//新增
FuncState.prototype.getActvar = function() {
    return this._actvar;
};

if (typeof module !== 'undefined') {
    module.exports = FuncState;
} else if (metamorphose) {
    metamorphose.FuncState = FuncState;
}
})(typeof window !== 'undefined' && window.metamorphose);
