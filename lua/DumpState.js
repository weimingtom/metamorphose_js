;(function(metamorphose) {
var ByteArray = metamorphose ? metamorphose.ByteArray : require('../java/ByteArray.js');
var Loader = metamorphose ? metamorphose.Loader : require('./Loader.js');
//var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');

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
    this.DumpString((f.getSource() == p || this._strip) ? null : f.getSource());
    this.DumpInt(f.getLinedefined());
    this.DumpInt(f.getLastlinedefined());
    this._writer.writeByte(f.getNups());
    this._writer.writeByte(f.getNumparams());
    this._writer.writeBoolean(f.getIsVararg());
    this._writer.writeByte(f.getMaxstacksize());
    this.DumpCode(f);
    this.DumpConstants(f);
    this.DumpDebug(f);
};

// throws IOException
DumpState.prototype.DumpCode = function(f) {
    var n = f.getSizecode();
    var code = f.getCode(); //int [] 
    this.DumpInt(n);
    for (var i = 0; i < n; i++) {
        this.DumpInt(code[i]);
    }
};

// throws IOException
DumpState.prototype.DumpConstants = function(f) {
    var Lua = metamorphose ? metamorphose.Lua : require('./Lua.js');
    var n = f.getSizek();
    var k = f.getK(); //Slot[]
    this.DumpInt(n);
    for (var i = 0 ; i < n ; i++) {
        var o = (k[i]).getR();
        if (o == Lua.NIL) {
            this._writer.writeByte(Lua.TNIL);
        } else if (o instanceof Boolean || typeof(o) === 'boolean') { //FIXME:javascript specific
            this._writer.writeByte(Lua.TBOOLEAN);
            this._writer.writeBoolean(o);
        } else if (o == Lua.NUMBER) {
            this._writer.writeByte(Lua.TNUMBER);
            this.DumpNumber((k[i]).getD());
        } else if (o instanceof String || typeof(o) === 'string') { //FIXME:javascript specific
            this._writer.writeByte(Lua.TSTRING);
            this.DumpString(o);
        } else {
            //# assert false
        }
    }
    n = f.getSizep();
    this.DumpInt(n);
    for (i = 0 ; i < n ; i++) {
        var subfunc = f.getP()[i];
        this.DumpFunction(subfunc, f.getSource());
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
    var n = f.getSizelineinfo();
    this.DumpInt(n);
    for (var i = 0; i < n; i++) {
        this.DumpInt(f.getLineinfo()[i]);
    }
    n = f.getSizelocvars();
    this.DumpInt(n);
    for (i = 0; i < n; i++) {
        var locvar = f.getLocvars()[i];
        this.DumpString(locvar.getVarname());
        this.DumpInt(locvar.getStartpc());
        this.DumpInt(locvar.getEndpc());
    }
    n = f.getSizeupvalues();
    this.DumpInt(n);
    for (i = 0; i < n; i++) {
        this.DumpString(f.getUpvalues()[i]);
    }
};

//新增
DumpState.prototype.getWriter = function() {
    return this._writer;
};

if (typeof module !== 'undefined') {
    module.exports = DumpState;
} else if (metamorphose) {
    metamorphose.DumpState = DumpState;
}
})(typeof window !== 'undefined' && window.metamorphose);

