/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BlockCnt.java#1 $
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
var DumpState = function(writer, strip) {
    this._writer = writer;
    this._strip = strip;
};

//////////////// dumper ////////////////////

// throws IOException
DumpState.prototype.DumpHeader = function() {
    /*
     * In order to make the code more compact the dumper re-uses the
     * header defined in Loader.java.  It has to fix the endianness byte
     * first.
     */
    Loader.HEADER[6] = 0;
    //TODO:Java to AS3
    var b = new ByteArray();
    var len = Loader.HEADER.length;
    for (var i = 0; i < len; ++i) {
        b.writeByte(Loader.HEADER[i]);
    }
    this._writer.write(b);
};

// throws IOException
DumpState.prototype.DumpInt = function(i) {
    this._writer.writeInt(i);// big-endian
};

//throws IOException
DumpState.prototype.DumpNumber = function(d) {
    this._writer.writeDouble(d); // big-endian
};

// throws IOException
DumpState.prototype.DumpFunction = function(f, p) {
    this.DumpString((f.source == p || this._strip) ? null : f.source);
    this.DumpInt(f.linedefined);
    this.DumpInt(f.lastlinedefined);
    this._writer.writeByte(f.nups);
    this._writer.writeByte(f.numparams);
    this._writer.writeBoolean(f.isVararg);
    this._writer.writeByte(f.maxstacksize);
    this.DumpCode(f);
    this.DumpConstants(f);
    this.DumpDebug(f);
};

// throws IOException
DumpState.prototype.DumpCode = function(f) {
    var n = f.sizecode;
    var code = f.code; //int [] 
    this.DumpInt(n);
    for (var i = 0; i < n; i++) {
        this.DumpInt(code[i]);
    }
};

// throws IOException
DumpState.prototype.DumpConstants = function(f) {
    var n = f.sizek;
    var k = f.k; //Slot[]
    this.DumpInt(n);
    for (var i = 0 ; i < n ; i++) {
        var o = k[i].r;
        if (o == Lua.NIL) {
            this._writer.writeByte(Lua.TNIL);
        } else if (o is Boolean) {
            this._writer.writeByte(Lua.TBOOLEAN);
            this._writer.writeBoolean(o as Boolean);
        } else if (o == Lua.NUMBER) {
            this._writer.writeByte(Lua.TNUMBER);
            this.DumpNumber(k[i].d);
        } else if (o is String) {
            this._writer.writeByte(Lua.TSTRING);
            this.DumpString(o as String);
        } else {
            //# assert false
        }
    }
    n = f.sizep;
    this.DumpInt(n);
    for (i = 0 ; i < n ; i++) {
        var subfunc = f.p[i];
        this.DumpFunction(subfunc, f.source);
    }
};

// throws IOException
DumpState.prototype.DumpString = function(s) {
    if (s == null) {
        this.DumpInt(0);
    } else {
        /*
         * Strings are dumped by converting to UTF-8 encoding.  The MIDP
         * 2.0 spec guarantees that this encoding will be supported (see
         * page 9 of midp-2_0-fr-spec.pdf).  Nonetheless, any
         * possible UnsupportedEncodingException is left to be thrown
         * (it's a subclass of IOException which is declared to be thrown).
         */
        //TODO: Java to AS3
        var contents = new ByteArray();// s.getBytes("UTF-8"); //byte []
        contents.writeUTFBytes(s);
        var size = contents.length;
        this.DumpInt(size+1);
        this._writer.write(contents, 0, size);
        this._writer.writeByte(0);
    }
};

// throws IOException
DumpState.prototype.DumpDebug = function(f) {
    if (this._strip) {
        this.DumpInt(0);
        this.DumpInt(0);
        this.DumpInt(0);
        return;
    }
    var n = f.sizelineinfo;
    this.DumpInt(n);
    for (var i = 0; i < n; i++) {
        this.DumpInt(f.lineinfo[i]);
    }
    n = f.sizelocvars;
    this.DumpInt(n);
    for (i = 0; i < n; i++) {
        var locvar = f.locvars[i];
        this.DumpString(locvar.varname);
        this.DumpInt(locvar.startpc);
        this.DumpInt(locvar.endpc);
    }
    n = f.sizeupvalues;
    this.DumpInt(n);
    for (i = 0; i < n; i++) {
        this.DumpString(f.upvalues[i]);
    }
};

//新增
DumpState.prototype.getWriter = function() {
    return this._writer;
};

module.exports = DumpState;
