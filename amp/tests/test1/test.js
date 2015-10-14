"use strict"

var _res;
function main() {
    $.get("test.txt").done(function (res) {
        _res = res;
        window.setTimeout(main3, 0);
    });
}
function main3() {
    var markup = _res;
    var node = compile(markup);
    console.log(node);

    var data = { contacts: [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }] };
    var data = { contacts: [{ name: "shooki" }, { name: "booki" }, { name: "mooki" }] };
    var el = node.bindPrms({}, data).process();
    $("body").append(el);
    $("input").css({ backgroundColor: "pink" });


    window.setTimeout(function () {
        el = node.process();
        $("body").setChildNodes(el);
        //window.setTimeout(function () {
        //    //data.contacts.removeAt(0);
        //    data.contacts[0].name = "gggggggggggggggg";
        //    //data.contacts.push({ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] });
        //    //var data = { contacts: [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }] };
        //    el = node.process();
        //    $("body").setChildNodes(el);
        //}, 1000);
    }, 1000);
}

function compile(markup, globalCtx, ctl) {
    var compiler = new HierarchyCompiler();
    if (globalCtx == null) {
        globalCtx = new HierarchyControl();
    }
    if (ctl != null)
        globalCtx.ctl = ctl;

    var nodes = compiler.build(markup, globalCtx);
    return new HNode(nodes[0]);

    var processor = new HierarchyProcessor({ nodes: nodes, cache: false, });
    return processor.process;
}


/*
hello(world)
    imachild()

function(){
   return hello(world).append(imachild())
}

function invisible(){
  return { append: function(children){return children;} };
}


function compile(s) {
    var func = new Function("prm", "var res = " + s + ";\nreturn res;");
    return func;
}
function generate(node) {
    var sb = [];
    function process(node) {
        sb.push(node.text);
        sb.push(".append([" + node.children.select(generate).join(",") + "])");
    }
    process(node);
    return sb.join("");
}


//function generate(_nodes) {
//    function processNodes(nodes) {
//        return "[" + nodes.select(process).join(",") + "]";
//    }
//    function process(node) {
//        var sb = [];
//        sb.push("function(t) {");
//        sb.push("   var parent = "+node.text+";");
//        sb.push("   append(parent, "+processNodes(node.children) + "]);");
//        sb.push("}");
//        return sb.join("\n");
//    }
//    var s = processNodes(_nodes);
//    return s;
//}

function generate2(_nodes) {
    var tabSize = "    ";

    function processNodes(nodes, tab) {
        if (nodes.length == 0) {
            return "t => []";
        }
        return "t => [\n" + tab + nodes.select(function (node) { return tab + process(node, tab + tabSize) + ",\n" + tab; }).join("") + "]";
    }
    function processNode(node, tab) {
        return "t => " + node.text;
    }
    function process(node, tab) {
        return "t => append(" + processNode(node, tab) + "," + processNodes(node.children, tab) + ", t)";
    }
    var s = processNodes(_nodes, tabSize);
    return s;
}



    //function append(parentFunc, childrenFunc, data) {
    //    var parent = parentFunc(data);
    //    var res = parent;
    //    if (parent == null)
    //        res = childrenFunc(data);
    //    else if (parent.setTemplate) {
    //        res = parent.setTemplate(childrenFunc);
    //    }
    //    else if (parent.setChildren) {
    //        var childrenFuncs = childrenFunc(data);
    //        var children = childNodes.selectMany(function (func) {
    //            var ch = func(data);
    //            if (ch instanceof Array)
    //                return ch;
    //            return [ch];
    //        });
    //        res = parent.setChildren(children);
    //    }
    //    return res;
    //}

    //function main2() {
//    var res = _res;
//    var lines = res.lines();

//    var x = parse(lines);
//    console.log(x);
//    var y = generate(x);
//    console.log(y);
//    var func = compile(y);
//    console.log(func);

//    function append(parentFunc, childrenFunc, data) {
//        var parent = parentFunc(data);
//        var res = parent;
//        if (parent == null)
//            res = childrenFunc(data);
//        else if (parent.setTemplate) {
//            res = parent.setTemplate(childrenFunc);
//        }
//        else if (parent.setChildren) {
//            var childrenFuncs = childrenFunc(data);
//            var children = childrenFuncs.selectMany(function (func) {
//                var ch = func(data);
//                if (ch instanceof Array)
//                    return ch;
//                return [ch];
//            });
//            res = parent.setChildren(children);
//        }
//        return res;
//    }
//    var res = func(append);
//    console.log(res);
//    var data = [{ name: "shooki" }, { name: "booki" }];
//    var res2 = res(data).select(function (ch) { return ch(data); });
//    $("body").append(res2);
//}
function compile2(exp) {
    var func = new Function("append", "t", "var res = " + exp + ";\nreturn res;");
    return func;
}


*/