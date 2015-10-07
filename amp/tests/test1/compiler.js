function HierarchyCompiler() {
    var _this = this;
    Function.addTo(_this, [compile, compileWithContext, generate, parse, build]);

    function build(markup, ctx) {
        var lines = markup.lines();
        var nodes = parse(lines);
        var code = generate(nodes);
        var func = compileWithContext(code, ctx);
        var compiledNodes = func(ctx);
        return compiledNodes;
    }
    function compile(ctx, exp) {
        var func = new Function("t", "var res = " + exp + ";\nreturn res;");
        return func;
    }

    function isValidIdentifier(s) {
        return /[a-zA-Z_]+[a-zA-Z0-9]*/.test(s);
    }
    function compileWithContext(expr, ctx) {
        //TODO: verify all keys are legit vars
        var keys = Object.keys(ctx).where(isValidIdentifier);
        var code = [];
        if (keys.length > 0)
            code.push("var " + keys.select(function (key) { return key + "=__ctx." + key }).join(",") + ";");
        code.push("var __res = " + expr + ";");
        code.push(keys.select(function (key) { return "__ctx." + key + "=" + key + ";" }).join("\n"));
        code.push("return __res;");
        var func = new Function("__ctx", code.join("\n"));
        return func;
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
}