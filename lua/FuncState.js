;(function(metamorphose) {

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
    var newstack = this._freereg + n;
    if (newstack > this._f.maxstacksize) {
        if (newstack >= Lua.MAXSTACK) {
            this._ls.xSyntaxerror("function or expression too complex");
        }
        this._f.maxstacksize = newstack;
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
    // assert getOpMode(o) == iABC;
    // assert getBMode(o) != OP_ARG_N || b == 0;
    // assert getCMode(o) != OP_ARG_N || c == 0;
    return this.kCode(Lua.CREATE_ABC(o, a, b, c), this._ls.lastline);
};

/** Equivalent to luaK_codeABx. */
FuncState.prototype.kCodeABx = function(o, a, bc) {
    // assert getOpMode(o) == iABx || getOpMode(o) == iAsBx);
    // assert getCMode(o) == OP_ARG_N);
    return this.kCode(Lua.CREATE_ABx(o, a, bc), this._ls.lastline);
};

/** Equivalent to luaK_codeAsBx. */
FuncState.prototype.kCodeAsBx = function(o, a, bc) {
    return this.kCodeABx(o, a, bc+Lua.MAXARG_sBx);
};

/** Equivalent to luaK_dischargevars. */
FuncState.prototype.kDischargevars = function(e) {
    switch (e.kind) {
    case Expdesc.VLOCAL:
        e.kind = Expdesc.VNONRELOC;
        break;

    case Expdesc.VUPVAL:
        e.reloc(this.kCodeABC(Lua.OP_GETUPVAL, 0, e.info, 0));
        break;

    case Expdesc.VGLOBAL:
        e.reloc(this.kCodeABx(Lua.OP_GETGLOBAL, 0, e.info));
        break;

    case Expdesc.VINDEXED:
        this.__freereg(e.aux); //TODO:
        this.__freereg(e.info); //TODO:
        e.reloc(this.kCodeABC(Lua.OP_GETTABLE, 0, e.info, e.aux));
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
    if (e.k == Expdesc.VNONRELOC) {
        if (!e.hasjumps()) {
            return e.info;
        }
        if (e.info >= this._nactvar) {         // reg is not a local?
            this.exp2reg(e, e.info);   // put value on it
            return e.info;
        }
    }
    this.kExp2nextreg(e);    // default
    return e.info;
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
        if (!isnumeral(v))
            this.kExp2RK(v);
        break;
    }
};

FuncState.prototype.isnumeral = function(e) {
    return e.k == Expdesc.VKNUM &&
        e.t == FuncState.NO_JUMP &&
        e.f == FuncState.NO_JUMP;
};

/** Equivalent to luaK_nil. */
FuncState.prototype.kNil = function(from, n) {
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
    return this.addk(Lua.valueOfNumber(r)); //TODO:L->Lua
};

/** Equivalent to luaK_posfix. */
FuncState.prototype.kPosfix = function(op, e1, e2) {
    switch (op) {
    case Syntax.OPR_AND:
        /* list must be closed */
        //# assert e1.t == NO_JUMP
        this.kDischargevars(e2);
        e2.f = this.kConcat(e2.f, e1.f);
        e1.copy(e2); //TODO:
        break;

    case Syntax.OPR_OR:
        /* list must be closed */
        //# assert e1.f == NO_JUMP
        this.kDischargevars(e2);
        e2.t = this.kConcat(e2.t, e1.t);
        e1.copy(e2); //TODO:
        break;

    case Syntax.OPR_CONCAT:
        this.kExp2val(e2);
        if (e2.k == Expdesc.VRELOCABLE && Lua.OPCODE(this.getcode(e2)) == Lua.OP_CONCAT) {
            //# assert e1.info == Lua.ARGB(getcode(e2))-1
            this.freeexp(e1);
            this.setcode(e2, Lua.SETARG_B(this.getcode(e2), e1.info));
            e1.k = e2.k;
            e1.info = e2.info;
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
    var e2 = new Expdesc();// TODO:
    e2.init(Expdesc.VKNUM, 0);
    switch (op) {
    case Syntax.OPR_MINUS:
        if (e.kind == Expdesc.VK) {
            kExp2anyreg(e);
        }
        codearith(Lua.OP_UNM, e, e2);
        break;

    case Syntax.OPR_NOT:
        codenot(e);
        break;

    case Syntax.OPR_LEN:
        kExp2anyreg(e);
        codearith(Lua.OP_LEN, e, e2);
        break;

    default:
        throw new Error("IllegalArgumentException");
    }
};

/** Equivalent to luaK_reserveregs. */
FuncState.prototype.kReserveregs = function(n) {
    kCheckstack(n);
    this._freereg += n;
};

/** Equivalent to luaK_ret. */
FuncState.prototype.kRet = function(first, nret) {
    kCodeABC(Lua.OP_RETURN, first, nret+1, 0);
};

/** Equivalent to luaK_setmultret (in lcode.h). */
FuncState.prototype.kSetmultret = function(e) {
    kSetreturns(e, Lua.MULTRET);
};

/** Equivalent to luaK_setoneret. */
FuncState.prototype.kSetoneret = function(e) {
    if (e.kind == Expdesc.VCALL) {     // expression is an open function call?
        e.nonreloc(Lua.ARGA(getcode(e)));
    } else if (e.kind == Expdesc.VVARARG) {
        setargb(e, 2);
        e.kind = Expdesc.VRELOCABLE;
    }
};

/** Equivalent to luaK_setreturns. */
FuncState.prototype.kSetreturns = function(e, nresults) {
    if (e.kind == Expdesc.VCALL) {     // expression is an open function call?
        setargc(e, nresults+1);
    } else if (e.kind == Expdesc.VVARARG) {
        setargb(e, nresults+1);
        setarga(e, this._freereg);
        kReserveregs(1);
    }
};

/** Equivalent to luaK_stringK. */
FuncState.prototype.kStringK = function(s) {
    return addk(s/*.intern()*/);
};

FuncState.prototype.addk = function(o) {
    var hash = o;
    var v = _h._get(hash); //TODO:get
    if (v != null) {
        // :todo: assert
        return v; //TODO:
    }
    // constant not found; create a new entry
    this._f.constantAppend(this._nk, o);
    this._h.put(hash, new int(this._nk)); //TODO:
    return this._nk++;
};

FuncState.prototype.codearith = function(op, e1, e2) {
    if (constfolding(op, e1, e2))
        return;
    else {
        var o1 = kExp2RK(e1);
        var o2 = (op != Lua.OP_UNM && op != Lua.OP_LEN) ? kExp2RK(e2) : 0;
        freeexp(e2);
        freeexp(e1);
        e1.info = kCodeABC(op, 0, o1, o2);
        e1.k = Expdesc.VRELOCABLE;
    }
};

FuncState.prototype.constfolding = function(op, e1, e2) {
    var r = 0;
    if (!isnumeral(e1) || !isnumeral(e2))
        return false;

    var v1 = e1.nval;
    var v2 = e2.nval;
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
    e1.nval = r;
    return true;
};

FuncState.prototype.codenot = function(e) {
    kDischargevars(e);
    switch (e.k) {
    case Expdesc.VNIL:
    case Expdesc.VFALSE:
        e.k = Expdesc.VTRUE;
        break;

    case Expdesc.VK:
    case Expdesc.VKNUM:
    case Expdesc.VTRUE:
        e.k = Expdesc.VFALSE;
        break;

    case Expdesc.VJMP:
        invertjump(e);
        break;

    case Expdesc.VRELOCABLE:
    case Expdesc.VNONRELOC:
        discharge2anyreg(e);
        freeexp(e);
        e.info = kCodeABC(Lua.OP_NOT, 0, e.info, 0);
        e.k = Expdesc.VRELOCABLE;
        break;

    default:
        //# assert false
        break;
    }
    /* interchange true and false lists */
    { 
        var temp = e.f; 
        e.f = e.t; 
        e.t = temp; 
    }
    removevalues(e.f);
    removevalues(e.t);
};

FuncState.prototype.removevalues = function(list) {
    for (; list != NO_JUMP; list = getjump(list))
        patchtestreg(list, Lua.NO_REG);
};

FuncState.prototype.dischargejpc = function() {
    patchlistaux(this._jpc, this._pc, Lua.NO_REG, this._pc);
    this._jpc = NO_JUMP;
};

FuncState.prototype.discharge2reg = function(e, reg) {
    kDischargevars(e);
    switch (e.k) {
    case Expdesc.VNIL:
        kNil(reg, 1);
        break;

    case Expdesc.VFALSE:
    case Expdesc.VTRUE:
        kCodeABC(Lua.OP_LOADBOOL, reg, (e.k == Expdesc.VTRUE ? 1 : 0), 0);
        break;

    case Expdesc.VK:
        kCodeABx(Lua.OP_LOADK, reg, e.info);
        break;

    case Expdesc.VKNUM:
        kCodeABx(Lua.OP_LOADK, reg, kNumberK(e.nval));
        break;

    case Expdesc.VRELOCABLE:
        setarga(e, reg);
        break;

    case Expdesc.VNONRELOC:
        if (reg != e.info)
        {
          kCodeABC(Lua.OP_MOVE, reg, e.info, 0);
        }
        break;

    case Expdesc.VVOID:
    case Expdesc.VJMP:
        return ;

    default:
        //# assert false
    }
    e.nonreloc(reg);
};

FuncState.prototype.exp2reg = function(e, reg) {
    discharge2reg(e, reg);
    if (e.k == Expdesc.VJMP) {
        e.t = kConcat(e.t, e.info);  /* put this jump in `t' list */
    }
    if (e.hasjumps()) {
        var p_f = NO_JUMP;  /* position of an eventual LOAD false */
        var p_t = NO_JUMP;  /* position of an eventual LOAD true */
        if (need_value(e.t) || need_value(e.f)) {
            var fj = (e.k == Expdesc.VJMP) ? NO_JUMP : kJump();
            p_f = code_label(reg, 0, 1);
            p_t = code_label(reg, 1, 0);
            kPatchtohere(fj);
        }
        var finalpos = kGetlabel(); /* position after whole expression */
        patchlistaux(e.f, finalpos, reg, p_f);
        patchlistaux(e.t, finalpos, reg, p_t);
    }
    e.init(Expdesc.VNONRELOC, reg);
};

FuncState.prototype.code_label = function(a, b, jump) {
    kGetlabel();  /* those instructions may be jump targets */
    return kCodeABC(Lua.OP_LOADBOOL, a, b, jump);
};

/**
 * check whether list has any jump that do not produce a value
 * (or produce an inverted value)
 */
FuncState.prototype.need_value = function(list) {
    for (; list != NO_JUMP; list = getjump(list)) {
        var i = getjumpcontrol(list);
        var instr = this._f.code[i] ;
        if (Lua.OPCODE(instr) != Lua.OP_TESTSET)
            return true;
    }
    return false;  /* not found */
};

FuncState.prototype.freeexp = function(e) {
    if (e.kind == Expdesc.VNONRELOC) {
        __freereg(e.info);
    }
};

FuncState.prototype.setFreereg = function(freereg) {
    this._freereg = freereg;
};

FuncState.prototype.getFreereg = function() {
    return this._freereg;
};

FuncState.prototype.__freereg = function(reg) {
    if (!Lua.ISK(reg) && reg >= this._nactvar) {
        --this._freereg;
        // assert reg == freereg;
    }
};

FuncState.prototype.getcode = function(e) {
    return this._f.code[e.info];
};

FuncState.prototype.setcode = function(e, code) {
    this._f.code[e.info] = code ;
};

/** Equivalent to searchvar from lparser.c */
FuncState.prototype.searchvar = function(n) {
    // caution: descending loop (in emulation of PUC-Rio).
    for (var i = this._nactvar - 1; i >= 0; i--) {
        if (n == getlocvar(i).varname)
            return i;
    }
    return -1;  // not found
};

FuncState.prototype.setarga = function(e, a) {
    var at = e.info;
    var code = this._f.code; //int[] 
    code[at] = Lua.SETARG_A(code[at], a);
};

FuncState.prototype.setargb = function(e, b) {
    var at = e.info;
    var code = this._f.code; //int[] 
    code[at] = Lua.SETARG_B(code[at], b);
};

FuncState.prototype.setargc = function(e, c) {
    var at = e.info;
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
    if (l2 == NO_JUMP)
        return l1;
    else if (l1 == NO_JUMP)
        return l2;
    else {
        var list = l1;
        var next;
        while ((next = getjump(list)) != NO_JUMP)  /* find last element */
            list = next;
        fixjump(list, l2);
        return l1;
    }
};

/** Equivalent to <code>luaK_patchlist</code>. */
FuncState.prototype.kPatchlist = function(list, target) {
    if (target == this._pc)
        kPatchtohere(list);
    else {
        //# assert target < pc
        patchlistaux(list, target, Lua.NO_REG, target);
    }
};

FuncState.prototype.patchlistaux = function(list, vtarget, reg,
                        dtarget) {
    while (list != NO_JUMP) {
        var next = getjump(list);
        if (patchtestreg(list, reg))
            fixjump(list, vtarget);
        else
            fixjump(list, dtarget);  /* jump to default target */
        list = next;
    }
};

FuncState.prototype.patchtestreg = function(node, reg) {
    var i = getjumpcontrol(node);
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
    var code = this._f.code; //int []
    if (at >= 1 && testTMode(Lua.OPCODE(code[at-1])))
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
    opmode(0, 1, OP_ARG_R, OP_ARG_N, iABC),            /* OP_MOVE */
    opmode(0, 1, OP_ARG_K, OP_ARG_N, iABx),            /* OP_LOADK */
    opmode(0, 1, OP_ARG_U, OP_ARG_U, iABC),            /* OP_LOADBOOL */
    opmode(0, 1, OP_ARG_R, OP_ARG_N, iABC),            /* OP_LOADNIL */
    opmode(0, 1, OP_ARG_U, OP_ARG_N, iABC),            /* OP_GETUPVAL */
    opmode(0, 1, OP_ARG_K, OP_ARG_N, iABx),            /* OP_GETGLOBAL */
    opmode(0, 1, OP_ARG_R, OP_ARG_K, iABC),            /* OP_GETTABLE */
    opmode(0, 0, OP_ARG_K, OP_ARG_N, iABx),            /* OP_SETGLOBAL */
    opmode(0, 0, OP_ARG_U, OP_ARG_N, iABC),            /* OP_SETUPVAL */
    opmode(0, 0, OP_ARG_K, OP_ARG_K, iABC),            /* OP_SETTABLE */
    opmode(0, 1, OP_ARG_U, OP_ARG_U, iABC),            /* OP_NEWTABLE */
    opmode(0, 1, OP_ARG_R, OP_ARG_K, iABC),            /* OP_SELF */
    opmode(0, 1, OP_ARG_K, OP_ARG_K, iABC),            /* OP_ADD */
    opmode(0, 1, OP_ARG_K, OP_ARG_K, iABC),            /* OP_SUB */
    opmode(0, 1, OP_ARG_K, OP_ARG_K, iABC),            /* OP_MUL */
    opmode(0, 1, OP_ARG_K, OP_ARG_K, iABC),            /* OP_DIV */
    opmode(0, 1, OP_ARG_K, OP_ARG_K, iABC),            /* OP_MOD */
    opmode(0, 1, OP_ARG_K, OP_ARG_K, iABC),            /* OP_POW */
    opmode(0, 1, OP_ARG_R, OP_ARG_N, iABC),            /* OP_UNM */
    opmode(0, 1, OP_ARG_R, OP_ARG_N, iABC),            /* OP_NOT */
    opmode(0, 1, OP_ARG_R, OP_ARG_N, iABC),            /* OP_LEN */
    opmode(0, 1, OP_ARG_R, OP_ARG_R, iABC),            /* OP_CONCAT */
    opmode(0, 0, OP_ARG_R, OP_ARG_N, iAsBx),           /* OP_JMP */
    opmode(1, 0, OP_ARG_K, OP_ARG_K, iABC),            /* OP_EQ */
    opmode(1, 0, OP_ARG_K, OP_ARG_K, iABC),            /* OP_LT */
    opmode(1, 0, OP_ARG_K, OP_ARG_K, iABC),            /* OP_LE */
    opmode(1, 1, OP_ARG_R, OP_ARG_U, iABC),            /* OP_TEST */
    opmode(1, 1, OP_ARG_R, OP_ARG_U, iABC),            /* OP_TESTSET */
    opmode(0, 1, OP_ARG_U, OP_ARG_U, iABC),            /* OP_CALL */
    opmode(0, 1, OP_ARG_U, OP_ARG_U, iABC),            /* OP_TAILCALL */
    opmode(0, 0, OP_ARG_U, OP_ARG_N, iABC),            /* OP_RETURN */
    opmode(0, 1, OP_ARG_R, OP_ARG_N, iAsBx),           /* OP_FORLOOP */
    opmode(0, 1, OP_ARG_R, OP_ARG_N, iAsBx),           /* OP_FORPREP */
    opmode(1, 0, OP_ARG_N, OP_ARG_U, iABC),            /* OP_TFORLOOP */
    opmode(0, 0, OP_ARG_U, OP_ARG_U, iABC),            /* OP_SETLIST */
    opmode(0, 0, OP_ARG_N, OP_ARG_N, iABC),            /* OP_CLOSE */
    opmode(0, 1, OP_ARG_U, OP_ARG_N, iABx),            /* OP_CLOSURE */
    opmode(0, 1, OP_ARG_U, OP_ARG_N, iABC)            /* OP_VARARG */
];

FuncState.prototype.getOpMode = function(m) {
    return OPMODE[m] & 3 ;
};

FuncState.prototype.testAMode = function(m) {
    return (OPMODE[m] & (1<<6)) != 0 ;
};

FuncState.prototype.testTMode = function(m) {
    return (OPMODE[m] & (1<<7)) != 0 ;
};

/** Equivalent to <code>luaK_patchtohere</code>. */
FuncState.prototype.kPatchtohere = function(list) {
    kGetlabel();
    this._jpc = kConcat(this._jpc, list);
};

FuncState.prototype.fixjump = function(at, dest) {
    var jmp = this._f.code[at];
    var offset = dest - (at + 1);
    //# assert dest != NO_JUMP
    if (Math.abs(offset) > Lua.MAXARG_sBx)
        this._ls.xSyntaxerror("control structure too long");
    this._f.code[at] = Lua.SETARG_sBx(jmp, offset);
};

FuncState.prototype.getjump = function(at) {
    var offset = Lua.ARGsBx(this._f.code[at]);
    if (offset == NO_JUMP)  /* point to itself represents end of list */
        return NO_JUMP;  /* end of list */
    else
        return (at+1)+offset;  /* turn offset into absolute position */
};

/** Equivalent to <code>luaK_jump</code>. */
FuncState.prototype.kJump = function() {
    var old_jpc = this._jpc;  /* save list of jumps to here */
    this._jpc = NO_JUMP;
    var j = kCodeAsBx(Lua.OP_JMP, 0, NO_JUMP);
    j = kConcat(j, old_jpc);  /* keep them on hold */
    return j;
};

/** Equivalent to <code>luaK_storevar</code>. */
FuncState.prototype.kStorevar = function(_var, ex) {
    switch (_var.k) {
    case Expdesc.VLOCAL:
        {
            freeexp(ex);
            exp2reg(ex, _var.info);
            return;
        }

    case Expdesc.VUPVAL:
        {
            var e = kExp2anyreg(ex);
            kCodeABC(Lua.OP_SETUPVAL, e, _var.info, 0);
            break;
        }

    case Expdesc.VGLOBAL:
        {
            var e2 = kExp2anyreg(ex);
            kCodeABx(Lua.OP_SETGLOBAL, e2, _var.info);
            break;
        }

    case Expdesc.VINDEXED:
        {
            var e3 = kExp2RK(ex);
            kCodeABC(Lua.OP_SETTABLE, _var.info, _var.aux, e3);
            break;
        }

    default:
        {
            /* invalid var kind to store */
            //# assert false
            break;
        }
    }
    freeexp(ex);
};

/** Equivalent to <code>luaK_indexed</code>. */
FuncState.prototype.kIndexed = function(t, k) {
    t.aux = kExp2RK(k);
    t.k = Expdesc.VINDEXED;
};

/** Equivalent to <code>luaK_exp2RK</code>. */
FuncState.prototype.kExp2RK = function(e) {
    kExp2val(e);
    switch (e.k) {
    case Expdesc.VKNUM:
    case Expdesc.VTRUE:
    case Expdesc.VFALSE:
    case Expdesc.VNIL:
        if (this._nk <= Lua.MAXINDEXRK) {   /* constant fit in RK operand? */
            e.info = (e.k == Expdesc.VNIL)  ? nilK() :
                (e.k == Expdesc.VKNUM) ? kNumberK(e.nval) :
                boolK(e.k == Expdesc.VTRUE);
            e.k = Expdesc.VK;
            return e.info | Lua.BITRK;
        } else 
            break;

    case Expdesc.VK:
        if (e.info <= Lua.MAXINDEXRK)  /* constant fit in argC? */
            return e.info | Lua.BITRK;
        else 
            break;

    default: 
        break;
    }
    /* not a constant in the right range: put it in a register */
    return kExp2anyreg(e);
};

/** Equivalent to <code>luaK_exp2val</code>. */
FuncState.prototype.kExp2val = function(e) {
    if (e.hasjumps())
        kExp2anyreg(e);
    else
        kDischargevars(e);
};

FuncState.prototype.boolK = function(b) {
    return addk(Lua.valueOfBoolean(b));
};

FuncState.prototype.nilK = function() {
    return addk(Lua.NIL);
};

/** Equivalent to <code>luaK_goiffalse</code>. */
FuncState.prototype.kGoiffalse = function(e) {
    var lj;  /* pc of last jump */
    kDischargevars(e);
    switch (e.k) {
    case Expdesc.VNIL:
    case Expdesc.VFALSE:
        lj = NO_JUMP;  /* always false; do nothing */
        break;

    case Expdesc.VTRUE:
        lj = kJump();  /* always jump */
        break;

    case Expdesc.VJMP:
        lj = e.info;
        break;

    default:
        lj = jumponcond(e, true);
        break;
    }
    e.t = kConcat(e.t, lj);  /* insert last jump in `t' list */
    kPatchtohere(e.f);
    e.f = NO_JUMP;
};

/** Equivalent to <code>luaK_goiftrue</code>. */
FuncState.prototype.kGoiftrue = function(e) {
    var lj;  /* pc of last jump */
    kDischargevars(e);
    switch (e.k) {
    case Expdesc.VK:
    case Expdesc.VKNUM:
    case Expdesc.VTRUE:
        lj = NO_JUMP;  /* always true; do nothing */
        break;

    case Expdesc.VFALSE:
        lj = kJump();  /* always jump */
        break;

    case Expdesc.VJMP:
        invertjump(e);
        lj = e.info;
        break;

    default:
        lj = jumponcond(e, false);
        break;
    }
    e.f = kConcat(e.f, lj);  /* insert last jump in `f' list */
    kPatchtohere(e.t);
    e.t = NO_JUMP;
};

FuncState.prototype.invertjump = function(e) {
    var at = getjumpcontrol(e.info);
    var code = this._f.code; //int []
    var instr = code[at] ;
    //# assert testTMode(Lua.OPCODE(instr)) && Lua.OPCODE(instr) != Lua.OP_TESTSET && Lua.OPCODE(instr) != Lua.OP_TEST
    code[at] = Lua.SETARG_A(instr, (Lua.ARGA(instr) == 0 ? 1 : 0));
};

FuncState.prototype.jumponcond = function(e, cond) {
    if (e.k == Expdesc.VRELOCABLE) {
        var ie = getcode(e);
        if (Lua.OPCODE(ie) == Lua.OP_NOT) {
            this._pc--;  /* remove previous OP_NOT */
            return condjump(Lua.OP_TEST, Lua.ARGB(ie), 0, cond ? 0 : 1);
      }
      /* else go through */
    }
    discharge2anyreg(e);
    freeexp(e);
    return condjump(Lua.OP_TESTSET, Lua.NO_REG, e.info, cond ? 1 : 0);
};

FuncState.prototype.condjump = function(op, a, b, c) {
    kCodeABC(op, a, b, c);
    return kJump();
};

FuncState.prototype.discharge2anyreg = function(e) {
    if (e.k != Expdesc.VNONRELOC) {
        kReserveregs(1);
        discharge2reg(e, this._freereg - 1);
    }
};

FuncState.prototype.kSelf = function(e, key) {
    kExp2anyreg(e);
    freeexp(e);
    var func = this._freereg;
    kReserveregs(2);
    kCodeABC(Lua.OP_SELF, func, e.info, kExp2RK(key));
    freeexp(key);
    e.info = func;
    e.k = Expdesc.VNONRELOC;
};

FuncState.prototype.kSetlist = function(base, nelems, tostore) {
    var c = (nelems - 1) / Lua.LFIELDS_PER_FLUSH + 1;
    var b = (tostore == Lua.MULTRET) ? 0 : tostore;
    //# assert tostore != 0
    if (c <= Lua.MAXARG_C)
        kCodeABC(Lua.OP_SETLIST, base, b, c);
    else {
        kCodeABC(Lua.OP_SETLIST, base, b, 0);
        kCode(c, this._ls.lastline);
    }
    this._freereg = base + 1;  /* free registers with list values */
};

FuncState.prototype.codecomp = function(op, cond, e1, e2) {
    var o1 = kExp2RK(e1);
    var o2 = kExp2RK(e2);
    freeexp(e2);
    freeexp(e1);
    if ((!cond) && op != Lua.OP_EQ) {
        /* exchange args to replace by `<' or `<=' */
        var temp = o1; 
        o1 = o2; 
        o2 = temp;  /* o1 <==> o2 */
        cond = true;
    }
    e1.info = condjump(op, (cond ? 1 : 0), o1, o2);
    e1.k = Expdesc.VJMP;
};

FuncState.prototype.markupval = function(level) {
    var b = this.bl;
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
