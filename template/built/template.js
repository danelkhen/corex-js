"use strict";
var Template = (function () {
    function Template() {
    }
    Template.registerTag = function (tag, html) {
        this.tags.set(tag.toUpperCase(), html);
    };
    Template.compileTemplateString = function (s) {
        if (s.startsWith("{{") && s.endsWith("}}")) {
            var code = s.substring(2, s.length - 2);
            return this.compileTemplateExpression(code);
        }
        return null;
    };
    Template.compileTemplateExpression = function (code) {
        var func = this.compiledExpressionsCache.get(code);
        if (func === undefined) {
            func = this._compileTemplateExpression(code);
            this.compiledExpressionsCache.set(code, func);
        }
        return func;
    };
    Template._compileTemplateExpression = function (code) {
        var parsed = FunctionHelper.parse(code);
        if (parsed != null) {
            if (parsed.type == "ArrowExpressionFunction") {
                var body = parsed.body;
                var prmsAndBody = parsed.prms.toArray();
                prmsAndBody.push("return " + body);
                var func_1 = Function.apply(null, prmsAndBody);
                return func_1;
            }
            else if (parsed.type == "ArrowFunction") {
                var body = parsed.body;
                var prmsAndBody = parsed.prms.toArray();
                prmsAndBody.push(body);
                var func_2 = Function.apply(null, prmsAndBody);
                return func_2;
            }
        }
        var func = new Function("___", "return ___." + code);
        return func;
    };
    Template.onPromise = function (promise) { return promise; };
    Template.dataBind = function (node, obj, thisContext) {
        var _this = this;
        if (node.nodeType == 3) {
            var node2 = node;
            if (node2.originalNodeValue == null)
                node2.originalNodeValue = node.nodeValue;
            var s = node2.originalNodeValue;
            if ((node.nextSibling != null || node.previousSibling != null) && s.trim() == "") {
                node.parentElement.removeChild(node);
                return;
            }
            var func = this.compileTemplateString(s);
            if (func != null)
                node.nodeValue = func.call(thisContext, obj);
        }
        else if (node.nodeType == 1) {
            var el = node;
            var ignoreAtt = el.getAttribute("_ignore");
            if (ignoreAtt != null)
                return;
            var tmpl = this.tags.get(el.nodeName);
            if (tmpl != null && el.childNodes.length == 0) {
                el.innerHTML = tmpl;
            }
            var atts = Helper.getAttributes(node);
            var stop = atts.first(function (att) {
                if (att.name == "_if") {
                    var func_3 = _this.compileTemplateExpression(att.value);
                    var res = func_3.call(thisContext, obj);
                    $(el).toggleClass("if_true", res);
                    $(el).toggleClass("if_false", !res);
                    if (!res)
                        return true;
                }
                if (att.name == "_for") {
                    var sourceFunc = _this.compileTemplateExpression(att.value);
                    var source = sourceFunc.call(thisContext, obj);
                    _this.repeat(el, source, thisContext);
                    return true;
                }
                if (att.name.startsWith("_")) {
                    var func_4 = _this.compileTemplateExpression(att.value);
                    if (att.name.startsWith("_on")) {
                        var evName = att.name.substr(3);
                        var evFullName = evName + ".templator";
                        $(el).off(evFullName).on(evFullName, function (e) {
                            var res = func_4.call(thisContext, e, obj);
                            if (Helper.isPromise(res)) {
                                res = _this.onPromise(res);
                            }
                            return res;
                        });
                    }
                    else {
                        var res = func_4.call(thisContext, obj);
                        var propName = att.name.substr(1);
                        if (propName == "class")
                            propName = "className";
                        node[propName] = res;
                    }
                    return false;
                }
                var func = _this.compileTemplateString(att.value);
                if (func != null) {
                    var res = func.call(thisContext, obj);
                    var propName = att.name;
                    if (propName == "class")
                        propName = "className";
                    node[propName] = res;
                }
                return false;
            });
            if (stop)
                return;
            Array.from(node.childNodes).forEach(function (t, i) {
                if ($(t).is(".template-instance"))
                    return; //these should be hanlded by forAtt
                _this.dataBind(t, obj, thisContext);
            });
        }
    };
    Template.repeat = function (el, list, thisContext) {
        var _this = this;
        var el2;
        if (typeof (el) == "string")
            el2 = $(el + ".template");
        else
            el2 = $(el);
        if (el2.length == 0) {
            console.warn("can't find template", el);
            return;
        }
        var el3 = el2[0];
        var els2 = el2.nextUntil(":not(.template-instance)").toArray();
        if (list != null) {
            var els = list.select(function (obj) {
                var el4 = els2.first(function (t) { return t._data == obj; });
                if (el4 == null) {
                    var el3_1 = el2.clone().removeAttr("_for");
                    el4 = el3_1[0];
                    el4._data = obj;
                    el3_1.removeClass("template").addClass("template-instance");
                }
                else {
                    els2.remove(el4);
                }
                _this.dataBind(el4, obj, thisContext);
                return el4;
            });
            $(els2).remove();
            el2.after(els);
        }
        else {
            $(els2).remove();
        }
    };
    Template.tags = new Map();
    Template.compiledExpressionsCache = new Map();
    return Template;
}());
exports.Template = Template;
var Helper = (function () {
    function Helper() {
    }
    Helper.isBrowserReversesAttributes = function () {
        if (this._isBrowserReversesAttributes == null) {
            var div = document.createElement("div");
            div.innerHTML = "<a b='c' d='e'/>";
            this._isBrowserReversesAttributes = div.firstChild.attributes[0].name == "d";
        }
        return this._isBrowserReversesAttributes;
    };
    Helper.getAttributes = function (node) {
        var list = Array.from(node.attributes);
        if (this.isBrowserReversesAttributes())
            list.reverse();
        return list;
    };
    Helper.isPromise = function (obj) {
        return obj != null && obj.then && obj.catch;
    };
    return Helper;
}());
exports.Helper = Helper;
var FunctionHelper = (function () {
    function FunctionHelper() {
    }
    FunctionHelper.parse = function (s) {
        var prms = this.parseArrowFunctionArgNames(s);
        if (prms != null) {
            var arrowEnd = s.indexOf("=>") + 2;
            var body = s.substr(arrowEnd);
            var type = "ArrowExpressionFunction";
            var body2 = body.trim();
            if (body2.startsWith("{") && body2.endsWith("}")) {
                type = "ArrowFunction";
                body = body2.substring(1, body2.length - 1);
            }
            return { body: body, prms: prms, type: type, name: null };
        }
        prms = this.parsePrms(s);
        if (prms == null)
            return null;
        var body = s.substring(s.indexOf("{") + 1, s.lastIndexOf("}") - 1);
        var name = s.substringBetween("function ", "(").trim();
        var type = name == "" ? "AnonymousFunction" : "NamedFunction";
        return { body: body, prms: prms, type: type, name: name };
    };
    FunctionHelper.parsePrms = function (s) {
        var list = [];
        var fnText = s.toString().replace(this.STRIP_COMMENTS, '');
        var argDecl = fnText.match(this.FN_ARGS);
        if (argDecl == null)
            return null;
        argDecl[1].split(this.FN_ARG_SPLIT).forEach(function (arg) {
            arg.replace(this.FN_ARG, function (all, underscore, name) {
                list.push(name);
            });
        });
        return list;
    };
    FunctionHelper.isValidIdentifier = function (s) {
        return /^[a-zA-Z_]+[a-zA-Z0-9]*$/.test(s);
    };
    FunctionHelper.parseArrowFunctionArgNames = function (s) {
        var index = s.indexOf("=>");
        if (index <= 0)
            return null;
        var sub = s.substr(0, index).trim();
        if (sub.startsWith("(") && sub.endsWith(")")) {
            var sub2 = sub.substr(1, sub.length - 2).trim();
            if (sub2 == "")
                return [];
            var tokens = sub2.split(',').selectInvoke("trim");
            if (tokens.all(this.isValidIdentifier))
                return tokens;
            return null;
        }
        if (this.isValidIdentifier(sub))
            return [sub];
        return null;
    };
    FunctionHelper.FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    FunctionHelper.FN_ARG_SPLIT = /,/;
    FunctionHelper.FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    FunctionHelper.STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    return FunctionHelper;
}());
exports.FunctionHelper = FunctionHelper;
