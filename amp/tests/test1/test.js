"use strict"

var _templates = {};

function main() {
    main3();
}


function main3() {
    var total = 20;
    var el;
    var data = { contacts: [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }] };
    for (var i = 0; i < total; i++) {
        data.contacts.push(Q.copy(data.contacts[0]));
    }
    test2.callAmp(data);
    return;
    var node;
    console.log("compile");
    time(function () {
        node = compileFakeFunction(test2);
    });
    console.log("bind");
    time(function () {
        node.bindArgs([data]);
    });
    console.log("Process");
    time(function () {
        //el = node.process();
        //$("body").setChildNodes(node.process().toChildNodes());
        node.process();
        //$("input").css({ backgroundColor: "pink" });
        //$("div").css({ backgroundColor: "red" });
    });
    //$("div").css({backgroundColor:"red"})
    window.setTimeout(function () {
        console.log("Process again");
        time(function () {
            node.process();
            //$("body").setChildNodes(el);
        });
        //window.setTimeout(function () {
        //    time(function () {
        //        data.contacts.removeAt(0);
        //        data.contacts[0].name = "gggggggggggggggg";
        //        data.contacts.push({ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] });
        //        data.contacts.push({ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] });
        //        data.contacts.push({ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] });
        //        //var data = { contacts: [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }] };
        //        el = node.process();
        //        $("body").setChildNodes(el);
        //    });
        //}, 1000);
    }, 1000);
}
function time(action) {
    var start = new Date();
    action();
    var end = new Date();
    console.log(end.valueOf() - start.valueOf() + "ms");
}

function shallowCopy(src, dest) {
    return $.extend(dest || {}, src);
}

function compile(markup, root) {
    var compiler = new HierarchyCompiler();
    var nodes = compiler.parse(markup, root);
    if (root == null && nodes.length == 1) {
        root = nodes[0];
    }
    else {
        if (root == null)
            root = {};
        if (root.ctx == null) {
            root.ctx = {};
            nodes.forEach(node => shallowCopy(node.ctx, root.ctx));
        }
        if (root.funcPrms == null)
            root.funcPrms = nodes.selectMany("funcPrms").distinct();
        root.children = nodes;
        if (root.func == null)
            root.func = ctx => {
                ctx.node.tunnelCtx();
                ctx.node.childrenProcessed = true;
                return ctx.node.children.select(t=>t.process());
            };
    }
    if (root.nodeProcessorGen == null)
        root.nodeProcessorGen = node => new HControl(node);
    var root2 = new HNode(root);
    //root2.children = nodes.select(t=>new HNode(t));
    return root2;
}

Function.prototype.callAmp = function(varargs) {
    var node = compileFakeFunction(this);
    node.bindArgs(Array.from(arguments));
    var res = node.process();
    return res;
}
Function.prototype.applyAmp = function(args) {
    var node = compileFakeFunction(this);
    node.bindArgs(args);
    var res = node.process();
    return res;
}

Function.prototype.toAmp = function(){
    return toAmpFunction(this);
}
function toAmpFunction(fakeFunc){
    if (fakeFunc.compiledNode != null)
        return fakeFunc.compiledNode.toFunction();
    var node = compileFakeFunction(fakeFunc);
    return node.toFunction();
}
function compileFakeFunction(func) {
    if (func.compiledNode != null)
        return func.compiledNode;
    var funcInfo = FunctionHelper.parse(func.toString());
    var ctx = {};
    funcInfo.prms.forEach(prm => ctx[prm] = null);
    var node = compile(funcInfo.body, { funcPrms: funcInfo.prms, ctx: ctx});
    func.compiledNode = node;
    return func.compiledNode;
}


/*
hello(world)
    imachild()

*/