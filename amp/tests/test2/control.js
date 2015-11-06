"use strict"
function Control(_opts) {
    if (this == null)
        return new Control(_opts);
    var _this = this;
    var _selfResult;
    var _childrenResults;

    Function.addTo(_this, [render, append, clone]);
    Object.defineProperties(_this, {
        opts: { get: function () { return _opts; } },
    });

    function clone() {
        return new Control(shallowCopy(_opts));
    }
    function append(list) {
        if (_opts.children == null)
            _opts.children = [];
        if (list instanceof Array)
            _opts.children.addRange(list.select(toControl));
        else
            _opts.children.add(toControl(list));
        return this;
    }
    function toControl(obj) {
        return Control.from(obj);
    }


    main();
    function main() {
    }

    function render() {
        if (_opts.render != null) {
            _selfResult = _opts.render.apply(_opts, arguments);
            return _selfResult
        }
        if (_opts.renderSelf != null)
            _selfResult = _opts.renderSelf.apply(_opts, arguments)
        else
            throw new Error("renderSelf not defined");
        if (_opts.children != null) {
            _childrenResults = _opts.children.select(t=>t.render.apply(t, arguments));
            if (_opts.setChildren)
                _opts.setChildren(_childrenResults);
            else
                $(toNodes(_selfResult)).setChildNodes(toNodes(_childrenResults));
        }
        return _selfResult;
    }
}
Control.from = function (obj) {
    if (obj instanceof Control)
        return obj;
    if (typeof (obj) == "function")
        return new Control({ renderSelf: obj });
    return new Control({ renderSelf: () => obj });
}


function toNodes(results) {
    var list = [];
    _addNodes(results, list);
    return list;
}
function _addNodes(res, list) {
    if (res == null)
        return;
    if (res instanceof Array)
        res.forEach(t=>_addNodes(t, list));
    else if (res instanceof jQuery)
        res.toArray().forEach(t=>_addNodes(t, list));
    else if (res instanceof Node)
        list.add(res);
    else
        list.add(document.createTextNode(res));
}

function HierarchyUtils() {
    Function.addTo(HierarchyUtils, [setChildren]);
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
}
HierarchyUtils();


$.fn.setChildNodes = function (childNodes) {
    if (!(childNodes instanceof Array))
        childNodes = childNodes.toArray();
    HierarchyUtils.setChildren(this[0], childNodes);
    return this;
}
$.fn.verify = function (selector) {
    if (!this.is(selector))
        return $.create(selector);
    return this;
}
function shallowCopy(src, dest) {
    return $.extend(dest || {}, src);
}



function Compiler() {
    var _this = this;
    Function.addTo(_this, [parse, parseLines, generate, compile]);
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
        var func = new Function("__ctx", code2);
        return func;
    }

    function compile(code, ctx) {
        var func = compileWithContext(code, ctx);
        return func;
    }
    function generate2(node, nodeText) {
        var tab = "".padRight(node.tab, " ");
        var s = tab+"C(" + nodeText + ")";
        var hasChildren = node.children != null && node.children.length > 0;
        if (hasChildren) {
            s += ".append([\n"
            s += node.children.select(generate).join(",\n");
            s += "])"
        }
        return s;
    }
    function generate(node) {
        var func = FunctionHelper.parse(node.text);
        var hasChildren = node.children != null && node.children.length > 0;
        var nodeText = node.text;
        var tab = "".padRight(node.tab, " ");
        if (func != null && hasChildren & func.prms!=null && func.prms.length>0) {
            var prms = func.prms.join(", ");
            if(func.prms.length>1)
                prms = "("+prms+")";
            var s = tab+prms +" => ";
            nodeText = func.body;
            s+=generate2(node, nodeText);
            return s;
        }
        return generate2(node, node.text);
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
