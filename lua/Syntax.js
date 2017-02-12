;(function(metamorphose) {

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Syntax.java#1 $
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
 * Syntax analyser.  Lexing, parsing, code generation.
 */

var Syntax = function(L, z, source) {
    /** current character */
    this._current = 0;
    /** input line counter */
    this._linenumber = 1;
    /** line of last token 'consumed' */
    this._lastline = 1;
    /**
    * The token value.  For "punctuation" tokens this is the ASCII value
    * for the character for the token; for other tokens a member of the
    * enum (all of which are > 255).
    */
    this._token = 0;
    /** Semantic info for token; a number. */
    this._tokenR = 0;
    /** Semantic info for token; a string. */
    this._tokenS = null;

    /** Lookahead token value. */
    this._lookahead = Syntax.TK_EOS;
    /** Semantic info for lookahead; a number. */
    this._lookaheadR = 0;
    /** Semantic info for lookahead; a string. */
    this._lookaheadS = null;

    /** Semantic info for return value from {@link #llex}; a number. */
    this._semR = 0;
    /** As {@link #semR}, for string. */
    this._semS = null;

    /** FuncState for current (innermost) function being parsed. */
    this._fs = null;
    this._L = null;

    /** input stream */
    this._z = null;

    /** Buffer for tokens. */
    this._buff = new StringBuffer();

    /** current source name */
    this._source = null;

    /** locale decimal point. */
    //TODO:这个变量貌似没有使用
    this._decpoint = '.'.charCodeAt();
    
    Syntax.init();
    this._L = L;
    this._z = z;
    this._source = source;
    this.next();	
};

/** End of File, must be -1 as that is what read() returns. */
Syntax.EOZ = -1;

Syntax.FIRST_RESERVED = 257;

// WARNING: if you change the order of this enumeration,
// grep "ORDER RESERVED"
Syntax.TK_AND       = Syntax.FIRST_RESERVED + 0;
Syntax.TK_BREAK     = Syntax.FIRST_RESERVED + 1;
Syntax.TK_DO        = Syntax.FIRST_RESERVED + 2;
Syntax.TK_ELSE      = Syntax.FIRST_RESERVED + 3;
Syntax.TK_ELSEIF    = Syntax.FIRST_RESERVED + 4;
Syntax.TK_END       = Syntax.FIRST_RESERVED + 5;
Syntax.TK_FALSE     = Syntax.FIRST_RESERVED + 6;
Syntax.TK_FOR       = Syntax.FIRST_RESERVED + 7;
Syntax.TK_FUNCTION  = Syntax.FIRST_RESERVED + 8;
Syntax.TK_IF        = Syntax.FIRST_RESERVED + 9;
Syntax.TK_IN        = Syntax.FIRST_RESERVED + 10;
Syntax.TK_LOCAL     = Syntax.FIRST_RESERVED + 11;
Syntax.TK_NIL       = Syntax.FIRST_RESERVED + 12;
Syntax.TK_NOT       = Syntax.FIRST_RESERVED + 13;
Syntax.TK_OR        = Syntax.FIRST_RESERVED + 14;
Syntax.TK_REPEAT    = Syntax.FIRST_RESERVED + 15;
Syntax.TK_RETURN    = Syntax.FIRST_RESERVED + 16;
Syntax.TK_THEN      = Syntax.FIRST_RESERVED + 17;
Syntax.TK_TRUE      = Syntax.FIRST_RESERVED + 18;
Syntax.TK_UNTIL     = Syntax.FIRST_RESERVED + 19;
Syntax.TK_WHILE     = Syntax.FIRST_RESERVED + 20;
Syntax.TK_CONCAT    = Syntax.FIRST_RESERVED + 21;
Syntax.TK_DOTS      = Syntax.FIRST_RESERVED + 22;
Syntax.TK_EQ        = Syntax.FIRST_RESERVED + 23;
Syntax.TK_GE        = Syntax.FIRST_RESERVED + 24;
Syntax.TK_LE        = Syntax.FIRST_RESERVED + 25;
Syntax.TK_NE        = Syntax.FIRST_RESERVED + 26;
Syntax.TK_NUMBER    = Syntax.FIRST_RESERVED + 27;
Syntax.TK_NAME      = Syntax.FIRST_RESERVED + 28;
Syntax.TK_STRING    = Syntax.FIRST_RESERVED + 29;
Syntax.TK_EOS       = Syntax.FIRST_RESERVED + 30;

Syntax.NUM_RESERVED = Syntax.TK_WHILE - Syntax.FIRST_RESERVED + 1;

/** Equivalent to luaX_tokens.  ORDER RESERVED */
Syntax._tokens = [ //new String[]
    "and", "break", "do", "else", "elseif",
    "end", "false", "for", "function", "if",
    "in", "local", "nil", "not", "or", "repeat",
    "return", "then", "true", "until", "while",
    "..", "...", "==", ">=", "<=", "~=",
    "<number>", "<name>", "<string>", "<eof>"
];

Syntax._reserved = null;

//TODO:实现静态初始化
Syntax.init = function() {
    if (Syntax._reserved == null) {
        Syntax._reserved = new Hashtable();

        for (var i = 0; i < Syntax.NUM_RESERVED; ++i) {
            //TODO:
            Syntax._reserved.put(Syntax._tokens[i], new int(Syntax.FIRST_RESERVED+i));
        }
    }
};

// From struct LexState

Syntax.prototype.getLastline = function() {
    return this._lastline;
};

// From <ctype.h>

// Implementations of functions from <ctype.h> are only correct copies
// to the extent that Lua requires them.
// Generally they have default access so that StringLib can see them.
// Unlike C's these version are not locale dependent, they use the
// ISO-Latin-1 definitions from CLDC 1.1 Character class.

Syntax.isalnum = function(c) {
    var ch = c;
    return Character.isUpperCase(ch) ||
        Character.isLowerCase(ch) ||
        Character.isDigit(ch);
};

Syntax.isalpha = function(c) {
    var ch = c;
    return Character.isUpperCase(ch) ||
        Character.isLowerCase(ch);
};

/** True if and only if the char (when converted from the int) is a
 * control character.
 */
Syntax.iscntrl = function(c) {
    return c < 0x20 || c == 0x7f;
};

Syntax.isdigit = function(c) {
    return Character.isDigit(c);
};

Syntax.islower = function(c) {
    return Character.isLowerCase(c);
};

/**
 * A character is punctuation if not cntrl, not alnum, and not space.
 */
Syntax.ispunct = function(c) {
    return !Syntax.isalnum(c) && !Syntax.iscntrl(c) && !Syntax.isspace(c);
};

Syntax.isspace = function(c) {
    return c == ' '.charCodeAt() ||
           c == '\f'.charCodeAt() ||
           c == '\n'.charCodeAt() ||
           c == '\r'.charCodeAt() ||
           c == '\t'.charCodeAt();
};

Syntax.isupper = function(c) {
    return Character.isUpperCase(c);
};

Syntax.isxdigit = function(c) {
    return Character.isDigit(c) ||
        ('a'.charCodeAt() <= c && c <= 'f'.charCodeAt()) ||
        ('A'.charCodeAt() <= c && c <= 'F'.charCodeAt());
};

// From llex.c

Syntax.prototype.check_next = function(_set) { // throws IOException
    if (_set.indexOf(String.fromCharCode(this._current)) < 0) {
        return false;
    }
    this.save_and_next();
    return true;
};

Syntax.prototype.currIsNewline = function() {
    return this._current == '\n'.charCodeAt() || 
        this._current == '\r'.charCodeAt();
};

Syntax.prototype.inclinenumber = function() { // throws IOException
    var old = this._current;
    //# assert currIsNewline()
    this.next();     // skip '\n' or '\r'
    if (this.currIsNewline() && this._current != old) {
        this.next();   // skip '\n\r' or '\r\n'
    }
    if (++this._linenumber < 0) {      // overflow
        this.xSyntaxerror("chunk has too many lines");
    }
};

Syntax.prototype.skip_sep = function() { // throws IOException
    var count = 0;
    var s = this._current;
    //# assert s == '[' || s == ']'
    this.save_and_next();
    while (this._current == '='.charCodeAt()) {
        this.save_and_next();
        count++;
    }
    return (this._current == s) ? count : (-count) - 1;
};

Syntax.prototype.read_long_string = function(isString, sep) { // throws IOException
    var cont = 0;
    this.save_and_next();  /* skip 2nd `[' */
    if (this.currIsNewline())  /* string starts with a newline? */
        this.inclinenumber();  /* skip it */
loop:
    while (true) {
        switch (String.fromCharCode(this._current)) {
        case String.fromCharCode(Syntax.EOZ): //TODO:
            this.xLexerror(isString ? "unfinished long string" :
                "unfinished long comment",
                Syntax.TK_EOS);
            break;  /* to avoid warnings */

        case ']':
            if (this.skip_sep() == sep) {
                this.save_and_next();  /* skip 2nd `]' */
                break loop;
            }
            break;

        case '\n':
        case '\r':
            this.__save('\n'.charCodeAt());
            this.inclinenumber();
            if (!isString)
                this._buff.setLength(0) ; /* avoid wasting space */
            break;

        default:
            if (isString) 
                this.save_and_next();
            else 
                this.next();
        }
    } /* loop */
    if (isString) {
        var rawtoken = this._buff.toString();
        var trim_by = 2 + sep;
        this._semS = rawtoken.substring(trim_by, rawtoken.length - trim_by);
    }
};

/** Lex a token and return it.  The semantic info for the token is
 * stored in <code>this.semR</code> or <code>this.semS</code> as
 * appropriate.
 */
Syntax.prototype.llex = function() { // throws IOException
    if (Lua.D) {
        console.log("llex() enter, current:" + this._current);
    }
    this._buff.setLength(0);
    while (true) {
        switch (String.fromCharCode(this._current)) {
        case '\n':
        case '\r':
            if (Lua.D) {
                console.log("case \\n\\r");
            }
            this.inclinenumber();
            continue;

        case '-':
            if (Lua.D) {
                console.log("case -");
            }
            this.next();
            if (this._current != '-'.charCodeAt())
                return '-'.charCodeAt();
            /* else is a comment */
            this.next();
            if (this._current == '['.charCodeAt()) {
                var sep2 = this.skip_sep();
                this._buff.setLength(0) ; /* `skip_sep' may dirty the buffer */
                if (sep2 >= 0) {
                    this.read_long_string(false, sep2);  /* long comment */
                    this._buff.setLength(0) ;
                    continue;
                }
            }
            /* else short comment */
            while (!this.currIsNewline() && this._current != Syntax.EOZ)
                this.next();
            continue;

        case '[':
            if (Lua.D) {
                console.log("case [");
            }
            var sep = this.skip_sep();
            if (sep >= 0) {
                this.read_long_string(true, sep);
                return Syntax.TK_STRING;
            } else if (sep == -1)
                return '['.charCodeAt();
            else
                this.xLexerror("invalid long string delimiter", Syntax.TK_STRING);
            continue;     // avoids Checkstyle warning.

        case '=':
            if (Lua.D) {
                console.log("case =");
            }
            this.next() ;
            if (this._current != '='.charCodeAt()) { 
                return '='.charCodeAt(); 
            } else {
                this.next() ;
                return Syntax.TK_EQ ;
            }

        case '<':
            if (Lua.D) {
                console.log("case <");
            }
            this.next();
            if (this._current != '='.charCodeAt()) { 
                return '<'.charCodeAt(); 
            } else {
                this.next() ;
                return Syntax.TK_LE ;
            }

        case '>':
            if (Lua.D) {
                console.log("case >");
            }
            this.next() ;
            if (this._current != '='.charCodeAt()) { 
                return '>'.charCodeAt(); 
            } else {
                this.next();
                return Syntax.TK_GE ;
            }

        case '~':
            if (Lua.D) {
                console.log("case ~");
            }
            this.next();
            if (this._current != '='.charCodeAt()) { 
                return '~'.charCodeAt(); 
            } else {
                this.next();
                return Syntax.TK_NE;
            }

        case '"':
        case '\'':
            if (Lua.D) {
                console.log("case \"'");
            }
            this.read_string(this._current);
            return Syntax.TK_STRING;

        case '.':
            if (Lua.D) {
                console.log("case .");
            }
            this.save_and_next();
            if (this.check_next(".")) {
                if (this.check_next(".")) {
                    return Syntax.TK_DOTS;
                } else {
                    return Syntax.TK_CONCAT ;
                }
            } else if (!isdigit(this._current)) {
                return '.'.charCodeAt();
            } else {
                this.read_numeral();
                return Syntax.TK_NUMBER;
            }

        case String.fromCharCode(EOZ): //TODO:
            if (Lua.D) {
                console.log("case EOZ");
            }
            return Syntax.TK_EOS;

        default:
            if (Syntax.isspace(this._current)) {
                if (Lua.D) {
                    console.log("isspace");
                }
                // assert !currIsNewline();
                this.next();
                continue;
            } else if (Syntax.isdigit(this._current)) {
                if (Lua.D) {
                    console.log("isdigit");
                }
                this.read_numeral();
                return Syntax.TK_NUMBER;
            } else if (Syntax.isalpha(this._current) || this._current == '_'.charCodeAt()) {
                if (Lua.D) {
                    console.log("isalpha or _");
                }
                // identifier or reserved word
                do {
                    this.save_and_next();
                } while (Syntax.isalnum(this._current) || this._current == '_'.charCodeAt());
                var s = this._buff.toString();
                var t = Syntax._reserved._get(s); //TODO:
                if (t == null) {
                    this._semS = s;
                    return Syntax.TK_NAME;
                } else {
                    return t;
                }
            } else {
                var c = this._current;
                this.next();
                return c; // single-char tokens
            }
        }
    }
    //unreachable
    return 0;
};

Syntax.prototype.next = function() { //throws IOException
    this._current = this._z.read();
    if (Lua.D) {
        trace("Syntax.next(), current:" + this._current + "(" + String.fromCharCode(this._current) +")");
    }
};

/** Reads number.  Writes to semR. */
Syntax.prototype.read_numeral = function() { // throws IOException
    // assert isdigit(current);
    do {
        save_and_next();
    } while (isdigit(this._current) || this._current == '.'.charCodeAt());
    if (check_next("Ee")) {      // 'E' ?
        check_next("+-"); // optional exponent sign
    }
    while (isalnum(this._current) || this._current == '_'.charCodeAt()) {
        save_and_next();
    }
    // :todo: consider doing PUC-Rio's decimal point tricks.
    try {
        this._semR = Number(this._buff.toString());
        return;
    } catch (e) {
        trace(e.getStackTrace());
        xLexerror("malformed number", TK_NUMBER);
    }
};

/** Reads string.  Writes to semS. */
Syntax.prototype.read_string = function(del) { // throws IOException
    save_and_next();
    while (this._current != del) {
        switch (String.fromCharCode(this._current)) {
        case String.fromCharCode(EOZ): //TODO:
            xLexerror("unfinished string", TK_EOS);
            continue;     // avoid compiler warning

        case '\n':
        case '\r':
            xLexerror("unfinished string", TK_STRING);
            continue;     // avoid compiler warning

        case '\\':
            {
                var c;
                next();       // do not save the '\'
                switch (String.fromCharCode(this._current)) {
                case 'a': 
                    c = 7; 
                    break;     // no '\a' in Java.

                case 'b': 
                    c = '\b'.charCodeAt(); 
                    break;

                case 'f': 
                    c = '\f'.charCodeAt(); 
                    break;

                case 'n': 
                    c = '\n'.charCodeAt(); 
                    break;

                case 'r': 
                    c = '\r'.charCodeAt(); 
                    break;

                case 't': 
                    c = '\t'.charCodeAt(); 
                    break;

                case 'v': 
                    c = 11; 
                    break;    // no '\v' in Java.

                case '\n': case '\r':
                    __save('\n'.charCodeAt());
                    inclinenumber();
                    continue;

                case String.fromCharCode(EOZ):
                    continue; // will raise an error next loop

                default:
                    if (!isdigit(this._current)) {
                        save_and_next();        // handles \\, \", \', \?
                    } else {   // \xxx
                        var i = 0;
                        c = 0;
                        do {
                            c = 10*c + (this._current - '0'.charCodeAt());
                            next();
                        } while (++i<3 && isdigit(this._current));
                        // In unicode, there are no bounds on a 3-digit decimal.
                        __save(c);
                    }
                    continue;
                }
                __save(c);
                next();
                continue;
            }

        default:
            save_and_next();
        }
    }
    save_and_next();    // skip delimiter
    var rawtoken = this._buff.toString();
    this._semS = rawtoken.substring(1, rawtoken.length - 1) ;
};

Syntax.prototype.save = function() {
    this._buff.append(this._current);
};

Syntax.prototype.__save = function(c) {
    this._buff.append(c);
};

Syntax.prototype.save_and_next = function() {  // throws IOException
    save();
    next();
};

/** Getter for source. */
Syntax.prototype.getSource = function() {
    return this._source;
};

Syntax.prototype.txtToken = function(tok) {
    switch (tok) {
    case TK_NAME:
    case TK_STRING:
    case TK_NUMBER:
        return this._buff.toString();

    default:
        return xToken2str(tok);
    }
};

/** Equivalent to <code>luaX_lexerror</code>. */
Syntax.prototype.xLexerror = function(msg, tok) {
    msg = source + ":" + this._linenumber + ": " + msg;
    if (tok != 0) {
        msg = msg + " near '" + txtToken(tok) + "'";
    }
    this._L.pushString(msg);
    this._L.dThrow(Lua.ERRSYNTAX);
};

/** Equivalent to <code>luaX_next</code>. */
Syntax.prototype.xNext = function() { // throws IOException
    this._lastline = this._linenumber;
    if (this._lookahead != TK_EOS) {     // is there a look-ahead token?
        this._token = this._lookahead;        // Use this one,
        this._tokenR = this._lookaheadR;
        this._tokenS = this._lookaheadS;
        this._lookahead = TK_EOS;       // and discharge it.
    } else {
        this._token = llex();
        this._tokenR = this._semR;
        this._tokenS = this._semS;
    }
};

/** Equivalent to <code>luaX_syntaxerror</code>. */
Syntax.prototype.xSyntaxerror = function(msg) {
    xLexerror(msg, this._token);
};

Syntax.xToken2str = function(token) {
    if (token < Syntax.FIRST_RESERVED) {
        // assert token == (char)token;
        if (iscntrl(token)) {
            return "char(" + token + ")";
        }
        return String.fromCharCode(token);
    }
    return Syntax._tokens[token - Syntax.FIRST_RESERVED];
};

// From lparser.c

Syntax.block_follow = function(token) {
    switch (token) {
    case TK_ELSE: case TK_ELSEIF: case TK_END:
    case TK_UNTIL: case TK_EOS:
        return true;

    default:
        return false;
    }
};

Syntax.prototype.check = function(c) {
    if (this._token != c) {
        error_expected(c);
    }
};

/**
 * @param what   the token that is intended to end the match.
 * @param who    the token that begins the match.
 * @param where  the line number of <var>what</var>.
 */
Syntax.prototype.check_match = function(what, who, where) { //throws IOException
    if (!testnext(what)) {
        if (where == this._linenumber) {
            error_expected(what);
        } else {
            xSyntaxerror("'" + xToken2str(what) + "' expected (to close '" +
                xToken2str(who) + "' at line " + where + ")");
        }
    }
};

Syntax.prototype.close_func = function() {
    removevars(0);
    this._fs.kRet(0, 0);  // final return;
    this._fs.close();
    // :todo: check this is a valid assertion to make
    //# assert fs != fs.prev
    this._fs = this._fs.prev;
};

Syntax.opcode_name = function(op) {
    switch (op) {
    case Lua.OP_MOVE: 
        return "MOVE";

    case Lua.OP_LOADK: 
        return "LOADK";

    case Lua.OP_LOADBOOL: 
        return "LOADBOOL";

    case Lua.OP_LOADNIL: 
        return "LOADNIL";

    case Lua.OP_GETUPVAL: 
        return "GETUPVAL";

    case Lua.OP_GETGLOBAL: 
        return "GETGLOBAL";

    case Lua.OP_GETTABLE: 
        return "GETTABLE";

    case Lua.OP_SETGLOBAL: 
        return "SETGLOBAL";

    case Lua.OP_SETUPVAL: 
        return "SETUPVAL";

    case Lua.OP_SETTABLE: 
        return "SETTABLE";

    case Lua.OP_NEWTABLE: 
        return "NEWTABLE";

    case Lua.OP_SELF: 
        return "SELF";

    case Lua.OP_ADD: 
        return "ADD";

    case Lua.OP_SUB: 
        return "SUB";

    case Lua.OP_MUL: 
        return "MUL";

    case Lua.OP_DIV: 
        return "DIV";

    case Lua.OP_MOD: 
        return "MOD";

    case Lua.OP_POW: 
        return "POW";

    case Lua.OP_UNM: 
        return "UNM";

    case Lua.OP_NOT: 
        return "NOT";

    case Lua.OP_LEN: 
        return "LEN";

    case Lua.OP_CONCAT: 
        return "CONCAT";

    case Lua.OP_JMP: 
        return "JMP";

    case Lua.OP_EQ: 
        return "EQ";

    case Lua.OP_LT: 
        return "LT";

    case Lua.OP_LE: 
        return "LE";

    case Lua.OP_TEST: 
        return "TEST";

    case Lua.OP_TESTSET: 
        return "TESTSET";

    case Lua.OP_CALL: 
        return "CALL";

    case Lua.OP_TAILCALL: 
        return "TAILCALL";

    case Lua.OP_RETURN: 
        return "RETURN";

    case Lua.OP_FORLOOP: 
        return "FORLOOP";

    case Lua.OP_FORPREP: 
        return "FORPREP";

    case Lua.OP_TFORLOOP: 
        return "TFORLOOP";

    case Lua.OP_SETLIST: 
        return "SETLIST";

    case Lua.OP_CLOSE: 
        return "CLOSE";

    case Lua.OP_CLOSURE: 
        return "CLOSURE";

    case Lua.OP_VARARG: 
        return "VARARG";

    default: 
        return "??"+op;
    }
};

Syntax.prototype.codestring = function(e, s) {
    e.init(Expdesc.VK, this._fs.kStringK(s));
};

Syntax.prototype.checkname = function(e) { // throws IOException
    codestring(e, str_checkname());
};

Syntax.prototype.enterlevel = function() {
    this._L.nCcalls++;
};

Syntax.prototype.error_expected = function(tok) {
    xSyntaxerror("'" + xToken2str(tok) + "' expected");
};

Syntax.prototype.leavelevel = function() {
    this._L.nCcalls--;
};

/** Equivalent to luaY_parser. */
Syntax.parser = function(L, _in, name) { //throws IOException
    var ls = new Syntax(L, _in, name);
    var fs = new FuncState(ls);
    ls.open_func(fs);
    fs.f.isVararg = true;
    ls.xNext();
    ls.chunk();
    ls.check(TK_EOS);
    ls.close_func();
    //# assert fs.prev == null
    //# assert fs.f.nups == 0
    //# assert ls.fs == null
    return fs.f;
};

Syntax.prototype.removevars = function(tolevel) {
    // :todo: consider making a method in FuncState.
    while (this._fs.nactvar > tolevel) {
        this._fs.getlocvar(--this._fs.nactvar).endpc = this._fs.pc;
    }
};

Syntax.prototype.singlevar = function(_var) { // throws IOException 
    var varname = str_checkname();
    if (singlevaraux(this._fs, varname, _var, true) == Expdesc.VGLOBAL) {
        _var.info = this._fs.kStringK(varname);
    }
};

Syntax.prototype.singlevaraux = function(f,
    n,
    _var,
    base) {
    if (f == null) {     // no more levels?
        _var.init(Expdesc.VGLOBAL, Lua.NO_REG);    // default is global variable
        return Expdesc.VGLOBAL;
    } else {
        var v = f.searchvar(n);
        if (v >= 0) {
            _var.init(Expdesc.VLOCAL, v);
            if (!base) {
                f.markupval(v);       // local will be used as an upval
            }
            return Expdesc.VLOCAL;
        } else {   // not found at current level; try upper one
            if (singlevaraux(f.prev, n, _var, false) == Expdesc.VGLOBAL) {
                return Expdesc.VGLOBAL;
            }
            _var.upval(indexupvalue(f, n, _var));     // else was LOCAL or UPVAL
            return Expdesc.VUPVAL;
        }
    }
};

Syntax.prototype.str_checkname = function() { // throws IOException
    check(TK_NAME);
    var s = this._tokenS;
    xNext();
    return s;
};

Syntax.prototype.testnext = function(c) { // throws IOException
    if (this._token == c) {
        xNext();
        return true;
    }
    return false;
};

// GRAMMAR RULES

Syntax.prototype.chunk = function() { // throws IOException
    // chunk -> { stat [';'] }
    var islast = false;
    enterlevel();
    while (!islast && !block_follow(this._token)) {
        islast = statement();
        testnext(';'.charCodeAt());
        //# assert fs.f.maxstacksize >= fs.freereg && fs.freereg >= fs.nactvar
        this._fs.freereg = this._fs.nactvar;
    }
    leavelevel();
};

Syntax.prototype.constructor = function(t) { // throws IOException
    // constructor -> ??
    var line = this._linenumber;
    var pc = this._fs.kCodeABC(Lua.OP_NEWTABLE, 0, 0, 0);
    var cc = new ConsControl(t) ;
    t.init(Expdesc.VRELOCABLE, pc);
    cc.v.init(Expdesc.VVOID, 0);        /* no value (yet) */
    this._fs.kExp2nextreg(t);  /* fix it at stack top (for gc) */
    checknext('{'.charCodeAt());
    do {
        //# assert cc.v.k == Expdesc.VVOID || cc.tostore > 0
        if (this._token == '}'.charCodeAt())
            break;
        closelistfield(cc);
        switch(String.fromCharCode(this._token)) {
        case String.fromCharCode(TK_NAME):  /* may be listfields or recfields */
            xLookahead();
            if (this._lookahead != '='.charCodeAt())  /* expression? */
                listfield(cc);
            else
                recfield(cc);
            break;

        case '[':  /* constructor_item -> recfield */
            recfield(cc);
            break;

        default:  /* constructor_part -> listfield */
            listfield(cc);
            break;
        }
    } while (testnext(','.charCodeAt()) || testnext(';'.charCodeAt()));
    check_match('}'.charCodeAt(), '{'.charCodeAt(), line);
    lastlistfield(cc);
    var code = this._fs.f.code; //int [] 
    code[pc] = Lua.SETARG_B(code[pc], oInt2fb(cc.na)); /* set initial array size */
    code[pc] = Lua.SETARG_C(code[pc], oInt2fb(cc.nh)); /* set initial table size */
};

Syntax.oInt2fb = function(x) {
    var e = 0;  /* exponent */
    while (x < 0 || x >= 16) {
        x = (x+1) >>> 1;
        e++;
    }
    return (x < 8) ? x : (((e+1) << 3) | (x - 8));
};

Syntax.prototype.recfield = function(cc) {  //throws IOException
    /* recfield -> (NAME | `['exp1`]') = exp1 */
    var reg = this._fs.freereg;
    var key = new Expdesc();
    var val = new Expdesc();
    if (this._token == TK_NAME) {
        // yChecklimit(fs, cc.nh, MAX_INT, "items in a constructor");
        checkname(key);
    }
    else  /* token == '[' */
        yindex(key);
    cc.nh++;
    checknext('='.charCodeAt());
    this._fs.kExp2RK(key);
    expr(val);
    this._fs.kCodeABC(Lua.OP_SETTABLE, cc.t.info, this._fs.kExp2RK(key), this._fs.kExp2RK(val));
    this._fs.freereg = reg;  /* free registers */
};

Syntax.prototype.lastlistfield = function(cc) {
    if (cc.tostore == 0)
        return;
    if (hasmultret(cc.v.k)) {
        this._fs.kSetmultret(cc.v);
        this._fs.kSetlist(cc.t.info, cc.na, Lua.MULTRET);
        cc.na--;  /* do not count last expression (unknown number of elements) */
    } else {
        if (cc.v.k != Expdesc.VVOID)
            this._fs.kExp2nextreg(cc.v);
        this._fs.kSetlist(cc.t.info, cc.na, cc.tostore);
    }
};

Syntax.prototype.closelistfield = function(cc) {
    if (cc.v.k == Expdesc.VVOID)
        return;  /* there is no list item */
    this._fs.kExp2nextreg(cc.v);
    cc.v.k = Expdesc.VVOID;
    if (cc.tostore == Lua.LFIELDS_PER_FLUSH) {
        this._fs.kSetlist(cc.t.info, cc.na, cc.tostore);  /* flush */
        cc.tostore = 0;  /* no more items pending */
    }
};

Syntax.prototype.expr = function(v) { // throws IOException
    subexpr(v, 0);
};

/** @return number of expressions in expression list. */
Syntax.prototype.explist1 = function(v) { // throws IOException
    // explist1 -> expr { ',' expr }
    var n = 1;  // at least one expression
    expr(v);
    while (testnext(','.charCodeAt())) {
        this._fs.kExp2nextreg(v);
        expr(v);
        ++n;
    }
    return n;
};

Syntax.prototype.exprstat = function() { // throws IOException
    // stat -> func | assignment
    var v = new LHSAssign();
    primaryexp(v.v);
    if (v.v.k == Expdesc.VCALL) {     // stat -> func
        this._fs.setargc(v.v, 1); // call statement uses no results
    } else {     // stat -> assignment
        v.prev = null;
        assignment(v, 1);
    }
};

/*
** check whether, in an assignment to a local variable, the local variable
** is needed in a previous assignment (to a table). If so, save original
** local value in a safe place and use this safe copy in the previous
** assignment.
*/
Syntax.prototype.check_conflict = function(lh, v) {
    var extra = this._fs.freereg;  /* eventual position to save local variable */
    var conflict = false ;
    for (; lh != null; lh = lh.prev) {
        if (lh.v.k == Expdesc.VINDEXED) {
            if (lh.v.info == v.info) {   /* conflict? */
              conflict = true;
              lh.v.info = extra;  /* previous assignment will use safe copy */
            }
            if (lh.v.aux == v.info) {   /* conflict? */
              conflict = true;
              lh.v.aux = extra;  /* previous assignment will use safe copy */
            }
        }
    }
    if (conflict) {
        this._fs.kCodeABC(Lua.OP_MOVE, this._fs.freereg, v.info, 0);  /* make copy */
        this._fs.kReserveregs(1);
    }
};

Syntax.prototype.assignment = function(lh, nvars) { // throws IOException
    var e = new Expdesc();
    var kind = lh.v.k;
    if (!(Expdesc.VLOCAL <= kind && kind <= Expdesc.VINDEXED))
        xSyntaxerror("syntax error");
    if (testnext(','.charCodeAt())) {   /* assignment -> `,' primaryexp assignment */
        var nv = new LHSAssign();
        nv.init(lh); //TODO:
        primaryexp(nv.v);
        if (nv.v.k == Expdesc.VLOCAL)
            check_conflict(lh, nv.v);
        assignment(nv, nvars+1);
    } else {   /* assignment -> `=' explist1 */
        var nexps;
        checknext('='.charCodeAt());
        nexps = explist1(e);
        if (nexps != nvars) {
            adjust_assign(nvars, nexps, e);
            if (nexps > nvars)
                this._fs.freereg -= nexps - nvars;  /* remove extra values */
        } else {
            this._fs.kSetoneret(e);  /* close last expression */
            this._fs.kStorevar(lh.v, e);
            return;  /* avoid default */
        }
    }
    e.init(Expdesc.VNONRELOC, this._fs.freereg - 1);    /* default assignment */
    this._fs.kStorevar(lh.v, e);
};

Syntax.prototype.funcargs = function(f) { // throws IOException
    var args = new Expdesc();
    var line = this._linenumber;
    switch (String.fromCharCode(this._token)) {
    case '(':         // funcargs -> '(' [ explist1 ] ')'
        if (line != lastline) {
            xSyntaxerror("ambiguous syntax (function call x new statement)");
        }
        xNext();
        if (this._token == ')'.charCodeAt()) { // arg list is empty? 
            args.kind = Expdesc.VVOID;
        } else {
            explist1(args);
            this._fs.kSetmultret(args);
        }
        check_match(')'.charCodeAt(), '('.charCodeAt(), line);
        break;

    case '{':         // funcargs -> constructor
        constructor(args);
        break;

    case String.fromCharCode(TK_STRING):   // funcargs -> STRING
        codestring(args, this._tokenS);
        xNext();        // must use tokenS before 'next'
        break;

    default:
        xSyntaxerror("function arguments expected");
        return;
    }
    // assert (f.kind() == VNONRELOC);
    var nparams;
    var base = f.info;        // base register for call
    if (args.hasmultret()) {
        nparams = Lua.MULTRET;     // open call
    } else {
        if (args.kind != Expdesc.VVOID) {
            this._fs.kExp2nextreg(args);  // close last argument
        }
        nparams = this._fs.freereg - (base+1);
    }
    f.init(Expdesc.VCALL, this._fs.kCodeABC(Lua.OP_CALL, base, nparams+1, 2));
    this._fs.kFixline(line);
    this._fs.freereg = base+1;        // call removes functions and arguments
                // and leaves (unless changed) one result.
};

Syntax.prototype.prefixexp = function(v) { // throws IOException
    // prefixexp -> NAME | '(' expr ')'
    switch (String.fromCharCode(this._token)) {
    case '(':
        {
            var line = this._linenumber;
            xNext();
            expr(v);
            check_match(')'.charCodeAt(), '('.charCodeAt(), line);
            this._fs.kDischargevars(v);
            return;
        }

    case String.fromCharCode(TK_NAME):
        singlevar(v);
        return;

    default:
        xSyntaxerror("unexpected symbol");
        return;
    }
};

Syntax.prototype.primaryexp = function(v) { // throws IOException 
    // primaryexp ->
    //    prefixexp { '.' NAME | '[' exp ']' | ':' NAME funcargs | funcargs }
    prefixexp(v);
    while (true) {
        switch (String.fromCharCode(this._token)) {
        case '.':  /* field */
            field(v);
            break;

        case '[':  /* `[' exp1 `]' */
            {
                var key = new Expdesc();
                this._fs.kExp2anyreg(v);
                yindex(key);
                this._fs.kIndexed(v, key);
            }
            break;

        case ':':  /* `:' NAME funcargs */
            {
                var key2 = new Expdesc() ;
                xNext();
                checkname(key2);
                this._fs.kSelf(v, key2);
                funcargs(v);
            }
            break;

        case '(':
        case String.fromCharCode(TK_STRING):
        case '{':     // funcargs
            this._fs.kExp2nextreg(v);
            funcargs(v);
            break;

        default:
            return;
        }
    }
};

Syntax.prototype.retstat = function() { // throws IOException
    // stat -> RETURN explist
    xNext();    // skip RETURN
    // registers with returned values (first, nret)
    var first = 0;
    var nret;
    if (block_follow(this._token) || this._token == ';'.charCodeAt()) {
        // return no values
        first = 0;
        nret = 0;
    } else {
        var e = new Expdesc();
        nret = explist1(e);
        if (hasmultret(e.k)) {
            this._fs.kSetmultret(e);
            if (e.k == Expdesc.VCALL && nret == 1) {   /* tail call? */
                this._fs.setcode(e, Lua.SET_OPCODE(this._fs.getcode(e), Lua.OP_TAILCALL));
                //# assert Lua.ARGA(fs.getcode(e)) == fs.nactvar
            }
            first = this._fs.nactvar;
            nret = Lua.MULTRET;  /* return all values */
        } else {
            if (nret == 1) {         // only one single value?
                first = this._fs.kExp2anyreg(e);
            } else {
                this._fs.kExp2nextreg(e);  /* values must go to the `stack' */
                first = this._fs.nactvar;  /* return all `active' values */
                //# assert nret == fs.freereg - first
            }
        }
    }
    this._fs.kRet(first, nret);
};

Syntax.prototype.simpleexp = function(v) { // throws IOException
    // simpleexp -> NUMBER | STRING | NIL | true | false | ... |
    //              constructor | FUNCTION body | primaryexp
    switch (this._token) {
    case TK_NUMBER:
        v.init(Expdesc.VKNUM, 0);
        v.nval = this._tokenR;
        break;

    case TK_STRING:
        codestring(v, this._tokenS);
        break;

    case TK_NIL:
        v.init(Expdesc.VNIL, 0);
        break;

    case TK_TRUE:
        v.init(Expdesc.VTRUE, 0);
        break;

    case TK_FALSE:
        v.init(Expdesc.VFALSE, 0);
        break;

    case TK_DOTS:  /* vararg */
        if (!this._fs.f.isVararg)
            xSyntaxerror("cannot use \"...\" outside a vararg function");
        v.init(Expdesc.VVARARG, this._fs.kCodeABC(Lua.OP_VARARG, 0, 1, 0));
        break;

    case '{'.charCodeAt():   /* constructor */
        constructor(v);
        return;

    case TK_FUNCTION:
        xNext();
        body(v, false, this._linenumber);
        return;

    default:
        primaryexp(v);
        return;
    }
    xNext();
};

Syntax.prototype.statement = function() { //throws IOException
    var line = this._linenumber;
    switch (this._token) {
    case TK_IF:   // stat -> ifstat
        ifstat(line);
        return false;

    case TK_WHILE:  // stat -> whilestat
        whilestat(line);
        return false;

    case TK_DO:       // stat -> DO block END
        xNext();         // skip DO
        block();
        check_match(TK_END, TK_DO, line);
        return false;

    case TK_FOR:      // stat -> forstat
        forstat(line);
        return false;

    case TK_REPEAT:   // stat -> repeatstat
        repeatstat(line);
        return false;

    case TK_FUNCTION:
        funcstat(line); // stat -> funcstat
        return false;

    case TK_LOCAL:    // stat -> localstat
        xNext();         // skip LOCAL
        if (testnext(TK_FUNCTION))  // local function?
            localfunc();
        else
            localstat();
        return false;

    case TK_RETURN:
        retstat();
        return true;  // must be last statement

    case TK_BREAK:  // stat -> breakstat
        xNext();       // skip BREAK
        breakstat();
        return true;  // must be last statement

    default:
        exprstat();
        return false;
    }
};

// grep "ORDER OPR" if you change these enums.
// default access so that FuncState can access them.
Syntax.OPR_ADD = 0;
Syntax.OPR_SUB = 1;
Syntax.OPR_MUL = 2;
Syntax.OPR_DIV = 3;
Syntax.OPR_MOD = 4;
Syntax.OPR_POW = 5;
Syntax.OPR_CONCAT = 6;
Syntax.OPR_NE = 7;
Syntax.OPR_EQ = 8;
Syntax.OPR_LT = 9;
Syntax.OPR_LE = 10;
Syntax.OPR_GT = 11;
Syntax.OPR_GE = 12;
Syntax.OPR_AND = 13;
Syntax.OPR_OR = 14;
Syntax.OPR_NOBINOPR = 15;

Syntax.OPR_MINUS = 0;
Syntax.OPR_NOT = 1;
Syntax.OPR_LEN = 2;
Syntax.OPR_NOUNOPR = 3;

/** Converts token into binary operator.  */
Syntax.getbinopr = function(op) {
    switch (String.fromCharCode(op)) {
    case '+': 
        return OPR_ADD;

    case '-': 
        return OPR_SUB;

    case '*': 
        return OPR_MUL;

    case '/': 
        return OPR_DIV;

    case '%': 
        return OPR_MOD;

    case '^': 
        return OPR_POW;

    case String.fromCharCode(TK_CONCAT): 
        return OPR_CONCAT;

    case String.fromCharCode(TK_NE): 
        return OPR_NE;

    case String.fromCharCode(TK_EQ): 
        return OPR_EQ;

    case '<': 
        return OPR_LT;

    case String.fromCharCode(TK_LE): 
        return OPR_LE;

    case '>': 
        return OPR_GT;

    case String.fromCharCode(TK_GE): 
        return OPR_GE;

    case String.fromCharCode(TK_AND): 
        return OPR_AND;

    case String.fromCharCode(TK_OR): 
        return OPR_OR;

    default: 
        return OPR_NOBINOPR;
    }
};

Syntax.getunopr = function(op) {
    switch (String.fromCharCode(op)) {
    case String.fromCharCode(TK_NOT): 
        return OPR_NOT;

    case '-': 
        return OPR_MINUS;

    case '#': 
        return OPR_LEN;

    default: 
        return OPR_NOUNOPR;
    }
};


// ORDER OPR
/**
* Priority table.  left-priority of an operator is
* <code>priority[op][0]</code>, its right priority is
* <code>priority[op][1]</code>.  Please do not modify this table.
*/
Syntax.PRIORITY = [ //new int[][]
    [6, 6], [6, 6], [7, 7], [7, 7], [7, 7],     // + - * / %
    [10, 9], [5, 4],                // power and concat (right associative)
    [3, 3], [3, 3],                 // equality and inequality
    [3, 3], [3, 3], [3, 3], [3, 3], // order
    [2, 2], [1, 1]                  // logical (and/or)
];

/** Priority for unary operators. */
Syntax.UNARY_PRIORITY = 8;

/**
 * Operator precedence parser.
 * <code>subexpr -> (simpleexp) | unop subexpr) { binop subexpr }</code>
 * where <var>binop</var> is any binary operator with a priority
 * higher than <var>limit</var>.
 */
Syntax.prototype.subexpr = function(v, limit) { // throws IOException
    enterlevel();
    var uop = getunopr(this._token);
    if (uop != OPR_NOUNOPR) {
        xNext();
        subexpr(v, UNARY_PRIORITY);
        this._fs.kPrefix(uop, v);
    } else {
        simpleexp(v);
    }
    // expand while operators have priorities higher than 'limit'
    var op = getbinopr(this._token);
    while (op != OPR_NOBINOPR && PRIORITY[op][0] > limit) {
        var v2 = new Expdesc();
        xNext();
        this._fs.kInfix(op, v);
        // read sub-expression with higher priority
        var nextop = subexpr(v2, PRIORITY[op][1]);
        this._fs.kPosfix(op, v, v2);
        op = nextop;
    }
    leavelevel();
    return op;
};

Syntax.prototype.enterblock = function(f, bl, isbreakable) {
    bl.breaklist = FuncState.NO_JUMP;
    bl.isbreakable = isbreakable;
    bl.nactvar = f.nactvar;
    bl.upval = false;
    bl.previous = f.bl;
    f.bl = bl;
    //# assert f.freereg == f.nactvar
};

Syntax.prototype.leaveblock = function(f) {
    var bl = f.bl;
    f.bl = bl.previous;
    removevars(bl.nactvar);
    if (bl.upval)
        f.kCodeABC(Lua.OP_CLOSE, bl.nactvar, 0, 0);
    /* loops have no body */
    //# assert (!bl.isbreakable) || (!bl.upval)
    //# assert bl.nactvar == f.nactvar
    f.freereg = f.nactvar;  /* free registers */
    f.kPatchtohere(bl.breaklist);
};

/*
** {======================================================================
** Rules for Statements
** =======================================================================
*/

Syntax.prototype.block = function() { // throws IOException
    /* block -> chunk */
    var bl = new BlockCnt();
    enterblock(this._fs, bl, false);
    chunk();
    //# assert bl.breaklist == FuncState.NO_JUMP
    leaveblock(this._fs);
};

Syntax.prototype.breakstat = function() {
    var bl = this._fs.bl;
    var upval = false;
    while (bl != null && !bl.isbreakable) {
        //TODO:||=
        upval ||= bl.upval;
        bl = bl.previous;
    }
    if (bl == null)
        xSyntaxerror("no loop to break");
    if (upval)
        this._fs.kCodeABC(Lua.OP_CLOSE, bl.nactvar, 0, 0);
    bl.breaklist = this._fs.kConcat(bl.breaklist, this._fs.kJump());
};

Syntax.prototype.funcstat = function(line) { //throws IOException
    /* funcstat -> FUNCTION funcname body */
    var b = new Expdesc();
    var v = new Expdesc();
    xNext();  /* skip FUNCTION */
    var needself = funcname(v);
    body(b, needself, line);
    this._fs.kStorevar(v, b);
    this._fs.kFixline(line);  /* definition `happens' in the first line */
};

Syntax.prototype.checknext = function(c) { // throws IOException
    check(c);
    xNext();
};

Syntax.prototype.parlist = function() { // throws IOException
    /* parlist -> [ param { `,' param } ] */
    var f = this._fs.f;
    var nparams = 0;
    if (this._token != ')'.charCodeAt()) {   /* is `parlist' not empty? */
        do {
            switch (this._token) {
            case TK_NAME:    /* param -> NAME */
                {
                    new_localvar(str_checkname(), nparams++);
                    break;
                }

            case TK_DOTS:    /* param -> `...' */
                {
                    xNext();
                    f.isVararg = true;
                    break;
                }

            default: 
                xSyntaxerror("<name> or '...' expected");
            }
        } while ((!f.isVararg) && testnext(','.charCodeAt()));
    }
    adjustlocalvars(nparams);
    f.numparams = this._fs.nactvar ; /* VARARG_HASARG not now used */
    this._fs.kReserveregs(this._fs.nactvar);  /* reserve register for parameters */
};

Syntax.prototype.getlocvar = function(i) {
    var fstate = this._fs;
    return fstate.f.locvars [fstate.actvar[i]] ;
};

Syntax.prototype.adjustlocalvars = function(nvars) {
    this._fs.nactvar += nvars;
    for (; nvars != 0; nvars--) {
        getlocvar(this._fs.nactvar - nvars).startpc = this._fs.pc;
    }
};

Syntax.prototype.new_localvarliteral = function(v, n) {
    new_localvar(v, n) ;
};

Syntax.prototype.errorlimit = function(limit, what) {
    var msg = this._fs.f.linedefined == 0 ?
        "main function has more than " + limit + " " + what :
        "function at line " + this._fs.f.linedefined + " has more than " + limit + " " + what;
    xLexerror(msg, 0);
};

Syntax.prototype.yChecklimit = function(v, l, m) {
    if (v > l)
        errorlimit(l,m);
};

Syntax.prototype.new_localvar = function(name, n) {
    yChecklimit(this._fs.nactvar + n + 1, Lua.MAXVARS, "local variables");
    this._fs.actvar[this._fs.nactvar + n] = registerlocalvar(name);
};

Syntax.prototype.registerlocalvar = function(varname) {
    var f = this._fs.f;
    f.ensureLocvars(this._L, this._fs.nlocvars, /*Short*/int.MAX_VALUE) ; //TODO:
    f.locvars[this._fs.nlocvars].varname = varname;
    return this._fs.nlocvars++;
};

Syntax.prototype.body = function(e, needself, line) { // throws IOException
    /* body ->  `(' parlist `)' chunk END */
    var new_fs = new FuncState(this);
    open_func(new_fs);
    new_fs.f.linedefined = line;
    checknext('('.charCodeAt());
    if (needself) {
        new_localvarliteral("self", 0);
        adjustlocalvars(1);
    }
    parlist();
    checknext(')'.charCodeAt());
    chunk();
    new_fs.f.lastlinedefined = this._linenumber;
    check_match(TK_END, TK_FUNCTION, line);
    close_func();
    pushclosure(new_fs, e);
};

Syntax.prototype.UPVAL_K = function(upvaldesc) {
    return (upvaldesc >>> 8) & 0xFF ;
};

Syntax.prototype.UPVAL_INFO = function(upvaldesc) {
    return upvaldesc & 0xFF;
};

Syntax.prototype.UPVAL_ENCODE = function(k, info) {
    //# assert (k & 0xFF) == k && (info & 0xFF) == info
    return ((k & 0xFF) << 8) | (info & 0xFF) ;
};

Syntax.prototype.pushclosure = function(func, v) {
    var f = this._fs.f;
    f.ensureProtos(this._L, this._fs.np) ;
    var ff = func.f;
    f.p[this._fs.np++] = ff;
    v.init(Expdesc.VRELOCABLE, this._fs.kCodeABx(Lua.OP_CLOSURE, 0, this._fs.np - 1));
    for (var i = 0; i < ff.nups; i++) {
        var upvalue = func.upvalues[i] ;
        var o = (UPVAL_K(upvalue) == Expdesc.VLOCAL) ? Lua.OP_MOVE :
                                                     Lua.OP_GETUPVAL;
        this._fs.kCodeABC(o, 0, UPVAL_INFO(upvalue), 0);
    }
};

Syntax.prototype.funcname = function(v) { // throws IOException
    /* funcname -> NAME {field} [`:' NAME] */
    var needself = false;
    singlevar(v);
    while (this._token == '.'.charCodeAt())
        field(v);
    if (this._token == ':'.charCodeAt()) {
        needself = true;
        field(v);
    }
    return needself;
};

Syntax.prototype.field = function(v) { //throws IOException
    /* field -> ['.' | ':'] NAME */
    var key = new Expdesc() ;
    this._fs.kExp2anyreg(v);
    xNext();  /* skip the dot or colon */
    checkname(key);
    this._fs.kIndexed(v, key);
};

Syntax.prototype.repeatstat = function(line) { //throws IOException
    /* repeatstat -> REPEAT block UNTIL cond */
    var repeat_init = this._fs.kGetlabel();
    var bl1 = new BlockCnt();
    var bl2 = new BlockCnt();
    enterblock(this._fs, bl1, true);  /* loop block */
    enterblock(this._fs, bl2, false);  /* scope block */
    xNext();  /* skip REPEAT */
    chunk();
    check_match(TK_UNTIL, TK_REPEAT, line);
    var condexit = cond();  /* read condition (inside scope block) */
    if (!bl2.upval) {   /* no upvalues? */
        leaveblock(this._fs);  /* finish scope */
        this._fs.kPatchlist(condexit, repeat_init);  /* close the loop */
    } else {   /* complete semantics when there are upvalues */
        breakstat();  /* if condition then break */
        this._fs.kPatchtohere(condexit);  /* else... */
        leaveblock(this._fs);  /* finish scope... */
        this._fs.kPatchlist(this._fs.kJump(), repeat_init);  /* and repeat */
    }
    leaveblock(this._fs);  /* finish loop */
};

Syntax.prototype.cond = function() { // throws IOException
    /* cond -> exp */
    var v = new Expdesc() ;
    expr(v);  /* read condition */
    if (v.k == Expdesc.VNIL)
        v.k = Expdesc.VFALSE;  /* `falses' are all equal here */
    this._fs.kGoiftrue(v);
    return v.f;
};

Syntax.prototype.open_func = function(funcstate) {
    var f = new Proto();  /* registers 0/1 are always valid */
    f.init2(source, 2);
    funcstate.f = f;
    funcstate.ls = this;
    funcstate.L = this._L;

    funcstate.prev = this._fs;   /* linked list of funcstates */
    this._fs = funcstate;
};

Syntax.prototype.localstat = function() {  // throws IOException
    /* stat -> LOCAL NAME {`,' NAME} [`=' explist1] */
    var nvars = 0;
    var nexps;
    var e = new Expdesc();
    do {
        new_localvar(str_checkname(), nvars++);
    } while (testnext(','.charCodeAt()));
    if (testnext('='.charCodeAt())) {
        nexps = explist1(e);
    } else {
        e.k = Expdesc.VVOID;
        nexps = 0;
    }
    adjust_assign(nvars, nexps, e);
    adjustlocalvars(nvars);
};

Syntax.prototype.forstat = function(line) { // throws IOException
    /* forstat -> FOR (fornum | forlist) END */
    var bl = new BlockCnt() ;
    enterblock(this._fs, bl, true);  /* scope for loop and control variables */
    xNext();  /* skip `for' */
    var varname = str_checkname();  /* first variable name */
    switch (String.fromCharCode(this._token)) {
    case '=':
        fornum(varname, line);
        break;

    case ',':
    case String.fromCharCode(TK_IN):
        forlist(varname);
        break;

    default:
        xSyntaxerror("\"=\" or \"in\" expected");
    }
    check_match(TK_END, TK_FOR, line);
    leaveblock(this._fs);  /* loop scope (`break' jumps to this point) */
};

Syntax.prototype.fornum = function(varname, line) { // throws IOException
    /* fornum -> NAME = exp1,exp1[,exp1] forbody */
    var base = this._fs.freereg;
    new_localvarliteral("(for index)", 0);
    new_localvarliteral("(for limit)", 1);
    new_localvarliteral("(for step)", 2);
    new_localvar(varname, 3);
    checknext('='.charCodeAt());
    exp1();  /* initial value */
    checknext(','.charCodeAt());
    exp1();  /* limit */
    if (testnext(','.charCodeAt()))
        exp1();  /* optional step */
    else {   /* default step = 1 */
        this._fs.kCodeABx(Lua.OP_LOADK, this._fs.freereg, this._fs.kNumberK(1));
        this._fs.kReserveregs(1);
    }
    forbody(base, line, 1, true);
};

Syntax.prototype.exp1 = function() { // throws IOException
    var e = new Expdesc();
    expr(e);
    var k = e.k;
    this._fs.kExp2nextreg(e);
    return k;
};

Syntax.prototype.forlist = function(indexname) { // throws IOException
    /* forlist -> NAME {,NAME} IN explist1 forbody */
    var e = new Expdesc() ;
    var nvars = 0;
    var base = this._fs.freereg;
    /* create control variables */
    new_localvarliteral("(for generator)", nvars++);
    new_localvarliteral("(for state)", nvars++);
    new_localvarliteral("(for control)", nvars++);
    /* create declared variables */
    new_localvar(indexname, nvars++);
    while (testnext(','.charCodeAt()))
        new_localvar(str_checkname(), nvars++);
    checknext(TK_IN);
    var line = this._linenumber;
    adjust_assign(3, explist1(e), e);
    this._fs.kCheckstack(3);  /* extra space to call generator */
    forbody(base, line, nvars - 3, false);
};

Syntax.prototype.forbody = function(base, line, nvars, isnum) { //throws IOException
    /* forbody -> DO block */
    var bl = new BlockCnt() ;
    adjustlocalvars(3);  /* control variables */
    checknext(TK_DO);
    var prep = isnum ? this._fs.kCodeAsBx(Lua.OP_FORPREP, base, FuncState.NO_JUMP) : this._fs.kJump();
    enterblock(this._fs, bl, false);  /* scope for declared variables */
    adjustlocalvars(nvars);
    this._fs.kReserveregs(nvars);
    block();
    leaveblock(this._fs);  /* end of scope for declared variables */
    this._fs.kPatchtohere(prep);
    var endfor = isnum ?
        this._fs.kCodeAsBx(Lua.OP_FORLOOP, base, FuncState.NO_JUMP) :
        this._fs.kCodeABC(Lua.OP_TFORLOOP, base, 0, nvars);
    this._fs.kFixline(line);  /* pretend that `OP_FOR' starts the loop */
    this._fs.kPatchlist((isnum ? endfor : this._fs.kJump()), prep + 1);
};

Syntax.prototype.ifstat = function(line) { // throws IOException
    /* ifstat -> IF cond THEN block {ELSEIF cond THEN block} [ELSE block] END */
    var escapelist = FuncState.NO_JUMP;
    var flist = test_then_block();  /* IF cond THEN block */
    while (this._token == TK_ELSEIF) {
        escapelist = this._fs.kConcat(escapelist, this._fs.kJump());
        this._fs.kPatchtohere(flist);
        flist = test_then_block();  /* ELSEIF cond THEN block */
    }
    if (this._token == TK_ELSE) {
        escapelist = this._fs.kConcat(escapelist, this._fs.kJump());
        this._fs.kPatchtohere(flist);
        xNext();  /* skip ELSE (after patch, for correct line info) */
        block();  /* `else' part */
    } else
        escapelist = this._fs.kConcat(escapelist, flist);

    this._fs.kPatchtohere(escapelist);
    check_match(TK_END, TK_IF, line);
};

Syntax.prototype.test_then_block = function() { // throws IOException
    /* test_then_block -> [IF | ELSEIF] cond THEN block */
    xNext();  /* skip IF or ELSEIF */
    var condexit = cond();
    checknext(TK_THEN);
    block();  /* `then' part */
    return condexit;
};

Syntax.prototype.whilestat = function(line) { // throws IOException
    /* whilestat -> WHILE cond DO block END */
    var bl = new BlockCnt() ;
    xNext();  /* skip WHILE */
    var whileinit = this._fs.kGetlabel();
    var condexit = cond();
    enterblock(this._fs, bl, true);
    checknext(TK_DO);
    block();
    this._fs.kPatchlist(this._fs.kJump(), whileinit);
    check_match(TK_END, TK_WHILE, line);
    leaveblock(this._fs);
    this._fs.kPatchtohere(condexit);  /* false conditions finish the loop */
};

Syntax.hasmultret = function(k) {
    return k == Expdesc.VCALL || k == Expdesc.VVARARG ;
};

Syntax.prototype.adjust_assign = function(nvars, nexps, e) {
    var extra = nvars - nexps;
    if (hasmultret(e.k)) {
        extra++;  /* includes call itself */
        if (extra < 0)
            extra = 0;
        this._fs.kSetreturns(e, extra);  /* last exp. provides the difference */
        if (extra > 1)
            this._fs.kReserveregs(extra-1);
    } else {
        if (e.k != Expdesc.VVOID)
            this._fs.kExp2nextreg(e);  /* close last expression */
        if (extra > 0) {
            var reg = this._fs.freereg;
            this._fs.kReserveregs(extra);
            this._fs.kNil(reg, extra);
        }
    }
};

Syntax.prototype.localfunc = function() { // throws IOException
    var b = new Expdesc();
    new_localvar(str_checkname(), 0);
    var v = new Expdesc();
    v.init(Expdesc.VLOCAL, this._fs.freereg);
    this._fs.kReserveregs(1);
    adjustlocalvars(1);
    body(b, false, this._linenumber);
    this._fs.kStorevar(v, b);
    /* debug information will only see the variable after this point! */
    this._fs.getlocvar(this._fs.nactvar - 1).startpc = this._fs.pc;
};

Syntax.prototype.yindex = function(v) { // throws IOException
    /* index -> '[' expr ']' */
    xNext();  /* skip the '[' */
    expr(v);
    this._fs.kExp2val(v);
    checknext(']'.charCodeAt());
};

Syntax.prototype.xLookahead = function() {  // throws IOException
    //# assert lookahead == TK_EOS
    this._lookahead = llex();
    this._lookaheadR = this._semR ;
    this._lookaheadS = this._semS ;
};

Syntax.prototype.listfield = function(cc) { // throws IOException
    expr(cc.v);
    yChecklimit(cc.na, Lua.MAXARG_Bx, "items in a constructor");
    cc.na++;
    cc.tostore++;
};

Syntax.prototype.indexupvalue = function(funcstate, name, v) {
    var f = funcstate.f;
    var oldsize = f.sizeupvalues;
    for (var i = 0; i < f.nups; i++) {
        var entry = funcstate.upvalues[i];
        if (UPVAL_K(entry) == v.k && UPVAL_INFO(entry) == v.info) {
            //# assert name.equals(f.upvalues[i])
            return i;
        }
    }
    /* new one */
    yChecklimit(f.nups + 1, Lua.MAXUPVALUES, "upvalues");
    f.ensureUpvals(this._L, f.nups);
    f.upvalues[f.nups] = name;
    //# assert v.k == Expdesc.VLOCAL || v.k == Expdesc.VUPVAL
    funcstate.upvalues[f.nups] = UPVAL_ENCODE(v.k, v.info) ;
    return f.nups++;
};

//新增
Syntax.prototype.getL = function() {
    return this._L;
};

if (typeof module !== 'undefined') {
    module.exports = Syntax;
} else if (metamorphose) {
    metamorphose.Syntax = Syntax;
}
})(typeof window !== 'undefined' && window.metamorphose);
