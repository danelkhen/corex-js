"use strict"

var _templates = {};

function main() {
    compileFakeFunction(test);
    compileFakeFunction(test2);
    main3();
    //.process();
    //var func = test2;
    //var x = FunctionHelper.parse(func.toString());
    //_templates[func.name] = x.body;
    //main3();
}

function loadTemplate(name) {
    var markup = _templates[name];
    var node = compile(markup);//, { func:() => document.body, ctx: new HControl() }
    return node;
}

function compileFakeFunction(func) {
    if (func.compiledNode != null)
        return func.compiledNode;
    var funcInfo = FunctionHelper.parse(func.toString());
    var node = compile(funcInfo.body, { funcPrms: funcInfo.prms });
    func.compiledNode = node;
    func.compiledFunc = function () {
        func.compiledNode.bindPrms.apply(this, arguments);
        var res = func.compiledNode.process();
        return res;
    }
    return func.compiledNode;
}
function main3() {
    var total = 20;
    var el;
    var data = { contacts: [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }] };
    for (var i = 0; i < total; i++) {
        data.contacts.push(Q.copy(data.contacts[0]));
    }
    var node;
    console.log("compile");
    time(function () {
        node = compileFakeFunction(test2);
    });
    console.log("bind");
    time(function () {
        node.bindPrms(data);
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
    var nodes = compiler.parse(markup);
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



/*
hello(world)
    imachild()

*/