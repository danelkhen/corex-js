"use strict";

//******** Function


//Acts like Function.prototype.bind, but preserves the 'this' context that is being sent to the newly generated function.
//function Hello(a,b,c){return [a,b,c].join();}
//Hello.bindArgs("a")("b","c")  -> a,b,c
Function.prototype.bindArgs = function () {
    var args = Array.from(arguments);
    var func = this;
    return function () {
        var args2 = args.concat(Array.from(arguments));
        return func.apply(this, args2);
    };
}
//String.hello(a,b,c) -> String.prototype.hello(b,c) (a=this)
Function.prototype.toPrototypeFunction = function () {
    var func = this;
    return function () {
        var args2 = Array.from(arguments);
        args2.insert(0, this);
        return func.apply(null, args2);
    };
}
//String.prototype.hello(b,c) -> String.hello(a,b,c) (a=this)
Function.prototype.toStaticFunction = function () {
    return Function.prototype.call.bind(this);
}
//converts a constructor to a function that doesn't require the new operator
Function.prototype.toNew = function () {
    var func = this;
    return function () {
        var x = func.applyNew(Array.from(arguments));
        return x;
    };
}
// Similar to func.apply(thisContext, args), but creates a new object instead of just calling the function - new func(args[0], args[1], args[2]...)
Function.prototype.applyNew = function (args) {
    var count = args == null ? 0 : args.length;
    var ctor = this;
    switch (count) {
        case 0: return new ctor();
        case 1: return new ctor(args[0]);
        case 2: return new ctor(args[0], args[1]);
        case 3: return new ctor(args[0], args[1], args[2]);
        case 4: return new ctor(args[0], args[1], args[2], args[3]);
        case 5: return new ctor(args[0], args[1], args[2], args[3], args[4]);
        case 6: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
        case 7: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
    throw new Error("Function.prototype.applyNew doesn't support more than 8 parameters");
}
// Similar to func.call(thisContext, args), but creates a new object instead of just calling the function - new func(arguments[0], arguments[1], arguments[2]...)
Function.prototype.callNew = function (varargs) {
    var args = Array.from(arguments);
    return this.applyNew(args);
}
Function.prototype.getName = function () {
    var func = this;
    if (func.name != null)
        return func.name;
    var name = func.toString().substringBetween("function ", "(").trim();
    func.name = name;
    return name;
}
Function.prototype.addTo = function (target) {
    return Function.addTo(target, [this]);
}
// Creates a combination of two functions, where the new function will invoke the two functions, if the left side is already a combination function, it will be cloned and add the new function to it
Function.combine = function (f1, f2) {
    if (f1 == null)
        return f2;
    if (f2 == null)
        return f1;
    var funcs;
    if (f1._isCombined) {
        var funcs = f1._funcs.toArray();
        funcs.add(f2);
    }
    else {
        funcs = [f1, f2];
    }
    return Function._combined(funcs);
}
Function._combined = function (funcs) {
    var func:any = function () {
        for (var i = 0; i < func._funcs.length; i++)
            func._funcs[i].apply(this, arguments);
    }
    func._isCombined = true;
    func._funcs = funcs;
    return func;
}


Function._lambda_cache = {};
Function.lambda = function (exp) {
    var cache = Function._lambda_cache;
    var func = cache[exp];
    if (func == null) {
        func = Function._lambda(exp);
        cache[exp] = func;
    }
    return func;
}
Function._lambda = function (exp) {
    var arrow = exp.indexOf("=>");
    var prms;
    var body;
    if (arrow > 0) {
        var tPrms = exp.substring(0, arrow).replace("(", "").replace(")", "");
        prms = tPrms.split(",").map(function (t) { return t.trim(); });
        body = exp.substring(arrow + 2);
    }
    else {
        prms = [];
        body = exp;
    }
    if (!body.contains("return"))
        body = "return " + body + ";";
    prms.push(body);
    return Function.applyNew(prms);
}
Function.addTo = function (target, funcs) {
    funcs = Array.wrapIfNeeded(funcs);
    funcs.forEach(function (func) {
        target[func.getName()] = func;
    });
}


