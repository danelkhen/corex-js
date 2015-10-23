"use strict"
function HierarchyCompiler() {
    var _this = this;
    Function.addTo(_this, [compile, compileWithContext, generate, parse, parseLines, compileGenFunc]);

    function parse(markup, parent) {
        var lines = markup.lines();
        var nodes = parseLines(lines);
        nodes = analyze(nodes, parent);
        //console.log(nodes);
        return nodes;
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
        if (!oneWay)
            code.push(keys.select(function (key) { return "__ctx." + key + "=" + key + ";" }).join("\n"));
        code.push("return __res;");
        var code2 = code.join("\n");
        var func = createFunc(["__ctx"], code2);
        return func;
    }
    function createFunc(prmNames, body) {
        var func = Function.applyNew(prmNames.concat(body));
        func.prmNames = prmNames;
        func.body = body;
        func._stringified = "function(" + prmNames.join(",") + "){\n" + body + "\n}\n";
        func.toString = function () {
            return this._stringified;
        }
        return func;
    }

    function shallowCopy(src, dest) {
        return $.extend(dest || {}, src);
    }

    function compileGenFunc(body, ctx, globalCtx) {
        return compileWithContext(compileWithContext(body, ctx).toString(), globalCtx);
    }

    function analyze(nodes, parent) {
        nodes.forEach(function (node) {
            if (parent == null) {
                node.ctx = { el: null };
            }
            else {
                node.ctx = shallowCopy(parent.ctx);
            }
            if (node.text.startsWith("//") || (parent != null && parent.type == "Comment")) {
                node.type = "Comment";
            }
            else {
                var parsed = FunctionHelper.parse(node.text);
                if (parsed != null) {
                    node.funcBody = parsed.body;
                    node.funcPrms = parsed.prms;
                    node.funcName = parsed.name;
                    node.funcType = parsed.type;
                    node.funcPrms.forEach(function (name) { node.ctx[name] = null; });
                    //node.funcGen = compileNodeFunc(node.funcInfo.body, node.ctx);
                }
                else {
                    node.funcBody = node.text;
                    node.funcPrms = [];
                }
            }
            analyze(node.children, node);
        });
        return nodes;
    }

    function generate(_nodes) {
        var code = Q.stringifyFormatted(_nodes);
        return code;
    }


    function compileExp(s) {
        var func = new Function("t", "return " + s + ";");
        return func;
    }


    function parseLines(_lines) {
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
    Function.addTo(FunctionHelper, [parse]);
    function parse(s) {
        var prms = parseArrowFunctionArgNames(s);
        if (prms != null) {
            var arrowEnd = s.indexOf("=>") + 2;
            var body = s.substr(arrowEnd);
            var type = "ArrowExpressionFunction";
            if(body.trim().startsWith("{"))
                type = "ArrowFunction";

            return { body: body, prms: prms, type:type, name: null };
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
