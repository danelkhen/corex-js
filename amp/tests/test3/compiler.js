"use strict"
function Compiler() {
    var _this = this;
    Function.addTo(_this, [parse, parseLines, generate, compile, setContext]);

    var _context;

    function setContext(ctx) {
        _context = ctx;
    }


    var _directives = {};
    Function.addTo(_directives, IMPORT);
    var _keywords = Object.keys(_directives);

    function IMPORT(name) {
        var obj = _context!=null ? _context[name] : null;
        if (obj == null)
            obj = window[name];
        return genImportExport(name, obj).imp;
    }

    function isValidIdentifier(s) {
        return /^[a-zA-Z_]+[a-zA-Z0-9]*$/.test(s);
    }

    function genImportExport(name, obj) {
        var keys = Object.keys(obj).where(isValidIdentifier);
        if (keys.length == 0)
            null;
        var x = {};
        x.imp = "var " + keys.select(function (key) { return key + "=" + name + "." + key }).join(",") + ";";
        x.exp = keys.select(function (key) { return name + "." + key + "=" + key + ";" }).join("\n");
        return x;
    }

    function compileWithContext(expr, ctx, oneWay) {
        var ie = genImportExport("__ctx", ctx);
        //TODO: verify all keys are legit vars
        var keys = Object.keys(ctx).where(isValidIdentifier);
        var code = [];
        if (keys.length > 0)
            code.push(ie.imp);
        if (oneWay) {
            code.push("return " + expr + ";\n");
        }
        else {
            code.push("var __res = \n" + expr + ";");
            code.push(ie.exp);
            code.push("return __res;");
        }
        var code2 = code.join("\n");
        var func = new Function("__ctx", code2);
        return func;
    }

    function compile(code, ctx) {
        if (ctx == null)
            ctx = _context;
        if (ctx == null)
            return new Function("return " + code);
        var func = compileWithContext(code, ctx);
        return func;
    }
    function isDirective(node) {
        return _keywords.any(keyword => startsWithKeyword(node.text, keyword));
    }

    function startsWithKeyword(s, keyword) {
        if (!s.startsWith(keyword))
            return false;
        var nextChar = s[keyword.length];
        if (nextChar == null)
            return true;
        return "( \t\r\n".contains(nextChar);
    }

    function generateNodes(nodes) {
        return "[\n" + nodes.select(generate).join(", \n") + "\n]";
    }

    function generate(node) {
        var nodeText = node.text.trim();
        if (isDirective(node)) {
            var code = compileWithContext(node.text, _directives)(_directives);
            return code;
        }

        if (nodeText.endsWith("{")) {
            nodeText = nodeText.substr(0, nodeText.length - 1);
        }

        var func = FunctionHelper.parse(nodeText);
        var hasChildren = node.children != null && node.children.length > 0;
        var tab = "".padRight(node.tab, " ");
        if (func != null && hasChildren & func.prms != null) {
            //var prms = func.prms.join(", ");
            var directives = node.children.where(isDirective);
            var children = node.children.where(t=>!isDirective(t));
            var s = "C(function " + (func.name || "") + "(" + func.prms.join(", ") + ") {\n";
            if (func.type == "ArrowExpressionFunction") {
                children = [{ text: func.body.trim(), children: children }];
            }
            s += directives.select(generate).join("\n");
            if (children.length == 1)
                s += "return " + generate(children[0]) + ";";
            else
                s += "return " + generateNodes(children) + ";";
            s += "\n})";
            return s;
        }

        var s = "C(" + nodeText;
        var hasChildren = node.children != null && node.children.length > 0;
        if (hasChildren) {
            s += ",\n"
            s += generateNodes(node.children);
        }
        s += ")";
        return s;
    }


    function generate2(node) {
        var nodeText = node.text;
        if (isDirective(node)) {
            var code = compileWithContext(node.text, _directives, true)(_directives);
            return code;
        }
        var func = FunctionHelper.parse(nodeText);
        var hasChildren = node.children != null && node.children.length > 0;
        var tab = "".padRight(node.tab, " ");
        if (func != null && hasChildren & func.prms != null && func.prms.length > 0) {
            //var prms = func.prms.join(", ");
            var directives = node.children.where(isDirective);
            var children = node.children.where(t=>!isDirective(t));
            var s = "function " + func.name + "(" + func.prms.join(", ") + ") {\n";
            if (nodeText.trim().endsWith("{")) {
                nodeText = "";
            }
            else {
                nodeText = func.body.trim();
                children = [{ text: nodeText, children: children }];
            }
            s += directives.select(generate).join("\n");
            s += "return " + generateNodes(children) + ";";
            s += "\n}";
            return s;
        }

        var s = nodeText;
        var hasChildren = node.children != null && node.children.length > 0;
        if (hasChildren) {
            s += ".setChildren(\n"
            s += generateNodes(node.children);
            s += ")";
        }
        return s;
    }

    function parse(markup, parent) {
        var lines = markup.lines();
        var nodes = parseLines(lines);
        return nodes;
    }

    function parseLines(_lines) {
        var stack = [{ children: [], tab: -1 }];

        _lines.forEach(function (line) {
            var tab = getTab(line);
            var node = { text: line.substr(tab), tab: tab, children: [] };
            var prev = stack.last();
            var prevTab = prev.tab;
            if (line.trim().endsWith("{")) {
                prev.children.push(node);
                stack.push(node);
            }
            else if (line.trim() == "}") {
                while (tab <= prevTab) {
                    stack.pop();
                    prev = stack.last();
                    prevTab = prev.tab;
                }
                //prev.children.push(node);
                //stack.push(node);
            }
            else if (tab > prevTab) {
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
Compiler.fromFakeFunc = function(func, ctx) {
    var compiler = new Compiler();
    if (ctx == null)
        ctx = {};
    if (ctx.LANG == null)
        ctx.LANG = new LANG();
    if (ctx.C == null)
        ctx.C = ctx.LANG.C;

    compiler.setContext(ctx);
    var nodes = compiler.parse(func.toString());
    if (nodes.length != 1)
        throw new Error();
    var root = nodes[0];
    var code = compiler.generate(root);
    var func3 = compiler.compile(code);
    func3.ctx = ctx;
    return func3;
    //console.log(func3);
    //var res = func3(ctx);
    //return res;
}

Function.prototype.compileAmp = function (defaultCtx) {
    var name = this.getName();
    var func = Compiler.fromFakeFunc(this);
    var func2 = function () {
        return func(this || defaultCtx || func.ctx).apply(this, arguments);
    };
    if(name!=null && name.length>0)
        window[name] = func2;
    return func2;
}



function FunctionHelper() {
    Function.addTo(FunctionHelper, [parse]);
    function parse(s) {
        var prms = parseArrowFunctionArgNames(s);
        if (prms != null) {
            var arrowEnd = s.indexOf("=>") + 2;
            var body = s.substr(arrowEnd);
            var type = "ArrowExpressionFunction";
            if (body.trim().startsWith("{"))
                type = "ArrowFunction";

            return { body: body, prms: prms, type: type, name: null };
        }
        prms = parsePrms(s);
        if (prms == null)
            return null;
        var body = s.substring(s.indexOf("{") + 1, s.lastIndexOf("}") - 1);
        var name = s.substringBetween("function ", "(").trim();
        var type = name == "" ? "AnonymousFunction" : "NamedFunction";
        return { body: body, prms: prms, type: type, name: name };
    }
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    function parsePrms(s) {
        var list = [];
        var fnText = s.toString().replace(STRIP_COMMENTS, '');
        var argDecl = fnText.match(FN_ARGS);
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
