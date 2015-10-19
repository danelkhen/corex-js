function HierarchyCompiler() {
    var _this = this;
    Function.addTo(_this, [compile, compileWithContext, generate, parse, build]);

    function build(markup, globalCtx) {
        var lines = markup.lines();
        var nodes = parse(lines);
        nodes = analyze(nodes);
        //console.log(nodes);
        var code = generate(nodes);
        //console.log(markup);
        //console.log(code);


        var func = compileWithContext(code, globalCtx);
        var compiledNodes = func(globalCtx);
        return compiledNodes;
    }
    function compile(ctx, exp) {
        var func = new Function("t", "var res = " + exp + ";\nreturn res;");
        return func;
    }

    function isValidIdentifier(s) {
        return /^[a-zA-Z_]+[a-zA-Z0-9]*$/.test(s);
    }
    function compileWithContext(expr, ctx, oneWay) {
        //TODO: verify all keys are legit vars
        var keys = Object.keys(ctx).where(isValidIdentifier);
        var code = [];
        if (keys.length > 0)
            code.push("var " + keys.select(function (key) { return key + "=__ctx." + key }).join(",") + ";");
        code.push("var __res = " + expr + ";");
        if(!oneWay)
            code.push(keys.select(function (key) { return "__ctx." + key + "=" + key + ";" }).join("\n"));
        code.push("return __res;");
        var code2 = code.join("\n");
        var func = new Function("__ctx", code2);
        return func;
    }

    function parseFunctionText(s) {
        var info = FunctionHelper.parseArgsAndBody(node.text);
        if (info == null) {

        }
        if (args == null) {
            args = Function.parseArgNames(node.text);
        }
        if (args != null) {
        }

    }

    /*
        

    */
    function shallowCopy(src, dest) {
        return $.extend(dest || {}, src);
    }

    function analyze(nodes, parent) {
        nodes.forEach(function (node) {
            if (parent == null) {
                node.ctx = { el: null };
            }
            else {
                node.ctx = shallowCopy(parent.ctx);
            }
            if (node.text.startsWith("//") || (parent!=null && parent.type=="Comment")) {
                node.type = "Comment";
            }
            else {
                if (node.funcInfo === undefined) {
                    node.funcInfo = FunctionHelper.parseArgsAndBody(node.text);
                    if (node.funcInfo != null) {
                        node.type = "FunctionExpression";
                        node.funcInfo.argNames.forEach(function (name) { node.ctx[name] = null; });
                        node.func = compileWithContext(node.funcInfo.body, node.ctx);
                    }
                }
                if (node.type == null && parent != null && parent.funcInfo != null) {
                    //node.funcInfo = { argNames: parent.funcInfo.argNames };
                    node.type = "ScopedExpression";
                    node.func = compileWithContext(node.text, node.ctx);
                }
                if (node.type == null) {
                    node.type = "Expression";
                    node.func = compileWithContext(node.text, node.ctx);
                }
            }
            analyze(node.children, node);
        });
        return nodes;
    }

    function generate(_nodes) {
        var code = Q.stringifyFormatted(_nodes);
        return code;
        var tabSize = "    ";
        var sb = [];
        var tab = "";

        function processNode(node) {
            var x;
            if (node.type == "FunctionExpression")
                x = "() => " + node.funcInfo.body;
            else if (node.type == "ScopedExpression")
                x = "() => " + node.text;
            else //Expression
                x = "() => " + node.text;

            var args = node.funcInfo == null ? [] : node.funcInfo.argNames;
            sb.push("function(" + args.join(", ") + "){\n");
            sb.push("return {func:" + x + ", childNodes: [");
            node.children.forEachJoin(processNode, function () { sb.push(",\n"); });
            sb.push("]};\n");
            sb.push("}\n");
        }
        //function processNodes(nodes, tab, parent){
        //    var children = node.children.select(function (child) { return processNode(child, tab + tabSize, node); });
        //}
        sb.push("[");
        _nodes.forEachJoin(processNode, function () { sb.push(",\n"); });
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

function FunctionHelper() {
    Function.addTo(FunctionHelper, [parseArgsAndBody]);
    function parseArgsAndBody(s) {
        var args = parseArrowFunctionArgNames(s);
        if (args != null) {
            var body = s.substr(s.indexOf("=>") + 2);
            return { body: body, argNames: args, type: "ArrowFunction" };
        }
        args = parseArgNames(s);
        if (args == null)
            return null;
        var body = s.substring(s.indexOf("{") + 1, s.lastIndexOf("}")-1);
        return { body: body, argNames: args, type: "ArrowFunction" };
    }
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    function parseArgNames(s) {
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

    function parseArrowFunctionArgNames(s) {
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
}
FunctionHelper();
