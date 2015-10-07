"use strict"

function setChildren(el, childElements) {
    childElements.forEach(function (childEl, index) {
        var currentChild = el.childNodes[index];
        if (currentChild == childEl)
            return;
        if (currentChild != null) {
            el.insertBefore(childEl, currentChild);
            return;
        }
        el.appendChild(childEl);
    });
    for (var i = childElements.length; i < el.childNodes.length; i++) {
        var childNode = el.childNodes[i];
        el.removeChild(childNode);
    }

    return el;
}

function existing(selector, opts) {
    var el = $(selector);
    if (opts) {
        Object.keys(opts).forEach(function (key) {
            el = el[key](opts[key]);
        });
    }
    var el2 = el[0];
    return {
        setChildren: function (children) {
            return setChildren(el2, children);
        }
    }
}
function create(selector, opts) {
    var el = $.create(selector);
    if (opts) {
        Object.keys(opts).forEach(function (key) {
            el = el[key](opts[key]);
        });
    }
    var el2 = el[0];
    return {
        setChildren: function (children) {
            return setChildren(el2, children);
        }
    }
}
function input(opts) {
    return create("input", opts);
}
function label(opts) {
    return create("label", opts);
}
function div(opts) {
    return create("div", opts);
}
function invisible(opts) {
    return {
        setChildren: function (children) {
            return children;
        }
    };
}
function repeater(list, opts) {
    return {
        setTemplate: function (templateFunc) {
            return list.selectMany(function (obj) {
                var children = templateFunc(obj);
                return children;
            });
        }
    };
}
var _res;
function main() {
    $.get("test.txt").done(function (res) {
        _res = res;
        window.setTimeout(main3, 0);
    });
}

function cached1(func) {
    var map = new Map();
    return function (prm) {
        if (map.has(prm))
            return map.get(prm);
        var res = func(prm);
        map.set(prm, res);
        return res;
    };
}

function addCaching(node) {
    node.func = cached1(node.func);
    node.childNodes.forEach(addCaching);
}
function main3() {
    var res = _res;
    var lines = res.lines();

    var x = parse(lines);
    console.log(x);
    var y = generate(x);
    console.log(y);
    var res = compileAndRunWithContext(y, {div:console.log('div')});
    //console.log(func);
    var data = [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }];
    //var res = func();
    console.log(res);
    res.forEach(addCaching);


    var root = { func: function () { return existing(document.body); }, childNodes: res };
    process(root, data);

    //var res2 = res.select(node=>process(node, data));
    //console.log(res2);
    ////var res2 = res(data).select(function (ch) { return ch(data); });
    //$("body").append(res2);

    function processChildNodes(node, data) {
        var childEls = [];
        node.childNodes.forEach(function (child) {
            var ch = process(child, data);
            if (ch instanceof Array)
                childEls.addRange(ch);
            else
                childEls.add(ch);
        });
        return childEls;
    }

    function process(node, data) {
        var parent = node.func(data);
        var res = parent;
        if (parent == null) {
            res = processChildNodes(node, data);
        }
        else if (parent.setTemplate) {
            res = parent.setTemplate(function (t) { return processChildNodes(node, t); });
        }
        else if (parent.setChildren) {
            var children = processChildNodes(node, data);
            res = parent.setChildren(children);
        }
        return res;
    }
    $("input").css({ backgroundColor: "pink" });
    window.setTimeout(function () {
        process(root, data);
        window.setTimeout(function () {
            var data = [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }];
            process(root, data);
            console.log(document.body.innerHTML);
        }, 1000);
    }, 1000);
}


function compile(ctx, exp) {
    var func = new Function("t", "var res = " + exp + ";\nreturn res;");
    return func;
}

function isValidIdentifier(s) {
    return /[a-zA-Z_]+[a-zA-Z0-9]*/.test(s);
}
function compileAndRunWithContext(expr, ctx) {
    //TODO: verify all keys are legit vars
    var keys = Object.keys(ctx).where(isValidIdentifier);
    var code = [];
    if (keys.length > 0)
        code.push("var " + keys.select(function (key) { return key + "=__ctx." + key }).join(",") + ";");
    code.push("var __res = " + expr + ";");
    code.push(keys.select(function (key) { return "__ctx." + key + "=" + key + ";" }).join("\n"));
    code.push("return __res;");
    var func = new Function("__ctx", code.join("\n"));
    var res = func(ctx);
    return res;
}


function generate(_nodes) {
    var tabSize = "    ";

    function processNodes(nodes, tab) {
        if (nodes.length == 0) {
            return "[]";
        }
        //return "t => [\n"+tab + nodes.select(function(node){return tab+process(node, tab+tabSize)+",\n"+tab;}).join("") + "]";
        return "[\n" + tab + tabSize + nodes.select(function (node) { return tab + process(node, tab + tabSize); }).join(",\n") + "\n" + tab + tabSize + "]";
    }
    function processNode(node, tab) {
        return "t => " + node.text;
    }
    function process(node, tab) {
        return "{func:" + processNode(node, tab) + ", childNodes:" + processNodes(node.children, tab) + "}";
    }
    var s = processNodes(_nodes, tabSize);
    return s;
}


function compileExp(s) {
    var func = new Function("t", "return " + s + ";");
    return func;
}
function compileNode(node) {
    node.compiled = compileExp(node.text);
    node.children.forEach(compileNode);
    return function () {
        runCompiled(node);
    };
}

function runCompiled(node) {
    var res = node.compiled();
    var res2 = res.set(node.children.select("compiled"));
    return res2;
}

function parse(_lines) {
    var stack = [{ children: [], tab: -1 }];

    _lines.forEach(function (line) {
        var tab = getTab(line);
        var node = { text: line.substr(tab), tab: tab, children: [] };
        var prev = stack.last();
        var prevTab = prev.tab;
        if (tab > prevTab) {
            prev.children.push(node);
            stack.push(node);
        }
        else if (tab == prevTab) {
            stack.pop();
            prev = stack.last();
            prevTab = prev.tab;
            prev.children.push(node);
            stack.push(node);
        }
        else {
            while (tab <= prevTab) {
                stack.pop();
                prev = stack.last();
                prevTab = prev.tab;
            }
            prev.children.push(node);
            stack.push(node);
        }
    });
    return stack[0].children;

    function getTab(s) {
        return s.search(/\S/);
    }
    function append(parent, child) {
        return s.search(/\S/);
    }

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