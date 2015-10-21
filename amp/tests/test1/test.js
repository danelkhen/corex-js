"use strict"

var _templates = {};

function main() {
    var func = test2;
    var x = FunctionHelper.parse(func.toString());
    _templates[func.name] = x.body;
    main3();
}

function loadTemplate(name) {
    var markup = _templates[name];
    var node = compile(markup);//, { func:() => document.body, ctx: new HControl() }
    return node;
}
function main3() {
    var total = 20;
    var el;
    var data = { contacts: [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }] };
    for (var i = 0; i < total; i++) {
        data.contacts.push(Q.copy(data.contacts[0]));
    }
    var node;
    time(function () {
        node = loadTemplate("test2");
        node.bindPrms(data);
    });
    time(function () {
        //el = node.process();
        //$("body").setChildNodes(node.process().toChildNodes());
        node.process();
        //$("input").css({ backgroundColor: "pink" });
        //$("div").css({ backgroundColor: "red" });
    });
    window.setTimeout(function () {
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

function compile(markup, root) {
    var compiler = new HierarchyCompiler();
    var nodes = compiler.parse(markup);
    if (root == null && nodes.length == 1) {
        root = nodes[0];
    }
    else {
        if (root == null)
            root = {};
        if (root.ctx == null)
            root.ctx = {};
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