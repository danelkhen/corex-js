"use strict"

function create(selector, opts) {
    var el = $.create(selector);
    if (opts) {
        Object.keys(opts).forEach(function (key) {
            el = el[key](opts[key]);
        });
    }
    return {
        set:function(children){
            var list = children.selectInvoke();
            el.append(list);
            return el[0];
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
        append: function (children) {
            return children;
        }
    };
}
function world() {
}
function hi() {
}
function hello2() {
}
function main() {
    $.get("test.txt").done(function (res) {

        var lines = res.lines();

        var x = parse(lines);
        console.log(x);
        //var y = x.select(generate);
        //console.log(y);
        var func = x.select(compile)[0];
        console.log(func);
        var res = func({ name: "shooki" });
        console.log(res);
        $("body").append(res);
    });
}

function compileExp(s) {
    var func = new Function("t","return "+s+";");
    return func;
}
function compile(node) {
    node.compiled = compileExp(node.text);
    node.children.forEach(compile);
    return function () {
        runCompiled(node);
    };
}

function runCompiled(node){
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

*/