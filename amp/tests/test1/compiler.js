function HierarchyCompiler() {
    var _this = this;
    Function.addTo(_this, [compile, compileWithContext, generate, parse, build]);

    function build(markup, ctx) {
        var lines = markup.lines();
        var nodes = parse(lines);
        nodes = analyze(nodes);
        console.log(nodes);
        var code = generate(nodes);
        console.log(markup);
        console.log(code);

        var func = compileWithContext(code, ctx);
        var compiledNodes = func(ctx);
        return compiledNodes;
    }
    function compile(ctx, exp) {
        var func = new Function("t", "var res = " + exp + ";\nreturn res;");
        return func;
    }

    function isValidIdentifier(s) {
        return /^[a-zA-Z_]+[a-zA-Z0-9]*$/.test(s);
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

    function analyze(nodes, parent) {
        nodes.forEach(function (node) {
            if (node.argNames === undefined) {
                node.argNames = Function.parseArrowFunctionArgNames(node.text);
                if (node.argNames == null)
                    node.argNames = Function.parseArgNames(node.text);
                if (node.argNames != null)
                    node.type = "FunctionExpression";
            }
            if (node.type == null && parent != null && parent.argNames != null) {
                node.argNames = parent.argNames;
                node.type = "ScopedExpression"
            }
            if (node.type == null)
                node.type = "Expression";
            analyze(node.children, node);
        });
        return nodes;
    }

    function generate(_nodes) {
        var tabSize = "    ";
        var sb = [];
        var tab = "";

        function processNode(node) {
            var x;
            if (node.type == "FunctionExpression")
                x = node.text;
            else if (node.type == "ScopedExpression")
                x = "(" + node.argNames.join(", ") + ") => " + node.text;
            else //Expression
                x = "() => " + node.text;


            sb.push("{func:" + x + ", childNodes: [");
            node.children.forEachJoin(processNode, function(){sb.push(",\n");});
            sb.push("]}");
        }
        //function processNodes(nodes, tab, parent){
        //    var children = node.children.select(function (child) { return processNode(child, tab + tabSize, node); });
        //}
        sb.push("[");
        _nodes.forEachJoin(processNode, function(){sb.push(",\n");});
        sb.push("]");
        var s = sb.join("");
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

(function () {
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    Function.parseArgNames = function (s) {
        var list = [];
        fnText = s.toString().replace(STRIP_COMMENTS, '');
        argDecl = fnText.match(FN_ARGS);
        if (argDecl == null)
            return null;
        argDecl[1].split(FN_ARG_SPLIT).forEach(function (arg) {
            arg.replace(FN_ARG, function (all, underscore, name) {
                list.push(name);
            });
        });
        return list;
    }
    function isValidIdentifier(s) {
        return /^[a-zA-Z_]+[a-zA-Z0-9]*$/.test(s);
    }

    Function.parseArrowFunctionArgNames = function (s) {
        var index = s.indexOf("=>");
        if (index <= 0)
            return null;
        var sub = s.substr(0, index).trim();
        if (sub.startsWith("(") && sub.endsWith(")")) {
            var sub2 = sub.substr(1, sub.length - 2).trim();
            if (sub2 == "")
                return [];
            var tokens = sub2.split(',').selectInvoke("trim");
            if (tokens.all(isValidIdentifier))
                return tokens;
            return null;
        }
        if (isValidIdentifier(sub))
            return [sub];
        return null;
    }
})();
