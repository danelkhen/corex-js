"use strict"
function Amp(_config) {
    var _this = this;

    var _tags;
    var _templates = [];
    var _templatesMap = {};
    var _compiler = new AmpExpressionCompiler(_this);
    var _builder = new AmpBuilder(_this);

    Function.addTo(_this, [getTemplates, loadTemplates, processHash, monitorHash, mount, getTemplateEl, ]);
    Object.defineProperties(_this, {
        _templates: { get: function () { return _templates; } },
        _compiler: { get: function () { return _compiler; } },
        _builder: { get: function () { return _builder; } },
    });


    function getTemplates(urls) {
        var promises = urls.select(function (url, i) { return $.get(url).success(function (res) { _templates[i] = res; }); });
        return $.when.apply($, promises);
    }

    function loadTemplates() {
        _templates.forEach(function (template) {
            $(template).toArray().forEach(function (tmplEl) {
                _templatesMap[tmplEl.nodeName.toLowerCase()] = tmplEl;
            });
        });
    }

    function monitorHash() {
        $(window).on("hashchange", processHash);
    }

    function processHash() {
        var tokens = window.location.hash.substr(1).split("/");
        _config.hashHandler.apply(null, tokens);
    }

    function mount(tag, dataItem, ctl) {
        return _builder.build(tag, { t: dataItem, ctl: ctl });
    }

    function getTemplateEl(tag) {
        var tmplEl = _templatesMap[tag];
        //if (tmplEl == null) {
        //    console.warn("can't find template ", tag);
        //    return null;
        //}
        return tmplEl;
    }




}

function AmpBuilder(_amp) {
    if (this == window || this == null)
        return new AmpBuilder();
    var _this = this;
    Function.addTo(_this, [build, create, update]);

    var _attributeProcessors = {
        "amp-tag": processAtt_ampTag,
        "if": processAtt_if,
        "each": processAtt_each,
        "do": processAtt_do,
    };

    function shallowCopy(src, dest) {
        return $.extend(dest || {}, src);
    }

    function getTemplateEl(tag) {
        return _amp.getTemplateEl(tag);
    }

    //context: {tmplEl: template element, el:currentElement, ctl:controlObject, parent:parentContext, rootEl:root element (in the template), t:data, e: event (only in event handlers) }
    function build(tag, ctx) {
        var tmplEl = getTemplateEl(tag);
        var el = $(tmplEl).clone()[0];
        ctx.rootEl = el;
        ctx.el = el;
        ctx.tmplEl = tmplEl;
        process(ctx);
        return $(ctx.el);
    }

    function create(markup, ctx) {
        var tmplEl = $(markup)[0];
        var el = $(tmplEl).clone()[0];
        ctx.tmplEl = tmplEl;
        ctx.el = el;
        //var ctx = { tmplEl: tmplEl, el: el };
        var res = process(ctx);
        $(ctx.el).data("ctx", ctx);
        //triggerReady(ctx.el);
        return ctx.el;
    }
    function update(el, ctx) {
        if (ctx == null)
            ctx = $(el).data("ctx");
        ctx.__isUpdate = true;
        process(ctx);
        return ctx.el;
    }

    //function triggerReady(el) {
    //    var handler = el.getAttribute("onready");
    //    var e = $.Event("ready");//target: el, currentTarget: el, //, { bubbles:false }
    //    //e.stopPropagation();
    //    $(el).triggerHandler(e);
    //    if (handler != null) {
    //        var func = new Function("e", handler);
    //        func(e);
    //    }
    //    Array.from(el.children).forEach(triggerReady);
    //}



    function _handlerWrapper(e) {
        e.data.ctx.e = e;
        return e.data.handler.call(this, e.data.ctx);
    }

    function process(ctx) {
        var res = processTagAndAttributes(ctx);
        if (res == "skipNextAttributesAndChildren")
            return res;

        //var res2 = processAttributes(ctx);
        //if (res2 == "skipNextAttributesAndChildren")
        //    return res2;

        var res3 = processChildNodes(ctx);
        return res3;
    }

    function processTagAndAttributes(ctx) {
        var externalTemplate = getTemplateEl(ctx.tmplEl.nodeName.toLowerCase());
        if (externalTemplate == null)
            return processAttributes(ctx);
        var tmplAtts = Array.from(ctx.tmplEl.attributes);
        var ampAtt = { name: "amp-tag", value: ctx.tmplEl.nodeName.toLowerCase() };
        tmplAtts.insert(1, ampAtt); //process it after the first if() to avoid redundant templating
        var res = processAttributes(ctx, tmplAtts);
        return res;
    }


    function processAttributes(ctx, tmplAtts) {
        var el = ctx.el;
        var tmplEl = ctx.tmplEl;
        if (tmplAtts == null)
            tmplAtts = Array.from(tmplEl.attributes);
        var lastRes;
        //TODO: consider saving original ctx and compare to new ctx and log changes
        for (var i = 0; i < tmplAtts.length; i++) {
            var tmplAtt = tmplAtts[i];
            var res = processAttribute(ctx, tmplAtt, tmplAtts);
            lastRes = res;
            if (res == "skipNextAttributesAndChildren")
                break;
            if (ctx.el == null)
                console.warn("el==null");
        }
        return lastRes;
    }

    function processAttribute(ctx, att, atts) {
        var processor = _attributeProcessors[att.name];
        if (processor != null)
            return processor(ctx, att, atts);
        //if (["do", "each", "if"].contains(att.name))
        //    return;
        if (att.name.startsWith("on")) {
            var tokens = _amp._compiler.parse(att.value);
            if (tokens.length == 1 && tokens[0].type == "text") {
                ctx.el.setAttribute(att.name, tokens[0].value);
            }
            else {
                var ctx2 = shallowCopy(ctx);
                ctx2.e = null;
                var handler = compile(att.value, ctx2);
                ctx.el.removeAttribute(att.name);
                $(ctx.el).on(att.name.substr(2), { handler: handler, ctx: ctx2 }, _handlerWrapper);
            }
            return null;
        }
        ctx.el.setAttribute(att.name, evaluate(att.value, ctx, ctx.el));
        return null;
    }

    function replaceTag(el, newTagName) {
        var div = document.createElement("DIV");
        Array.from(el.attributes).forEach(function (att) { div.setAttribute(att.name, att.value); });
        Array.from(el.childNodes).forEach(function (ch) { div.appendChild(ch); });
        return div;
    }

    // attribute value handler can return: null, "skipNextAttributesAndChildren"
    // generates element according to amp-tag, returns undef if no tags exist, null or element if exists as result
    // 
    function processAtt_ampTag(ctx, att, atts) {
        var tmplEl = ctx.tmplEl;
        var el = ctx.el;
        //var el = document.createElement(tmplEl.nodeName);
        var ampTag = att.value;//tmplEl.getAttribute("amp-tag");
        if (ampTag == "")
            return null;
        ctx.el.removeAttribute("amp-tag");
        var tmplEl2 = getTemplateEl(ampTag);

        var el2;
        if (ctx.__isUpdate) {
            el2 = ctx.el;
        }
        else {
            el2 = $(tmplEl2).clone()[0];
            el2 = replaceTag(el2, "div");
            ctx.el = el2;
        }
        var res = processNextAttributes(ctx, att, atts);
        if (res == "skipNextAttributesAndChildren")
            return res;

        if (!ctx.__isUpdate)
            $(el).replaceWith(el2);

        var ctx2 = shallowCopy(ctx);
        ctx2.rootEl = el2;
        ctx2.el = el2;
        ctx2.tmplEl = tmplEl2;

        var res2 = processAttributes(ctx2);
        ctx.el = ctx2.el;
        if (res2 == "skipNextAttributesAndChildren")
            return res2;

        var res3 = processChildNodes(ctx2);
        ctx.el = ctx2.el;

        return "skipNextAttributesAndChildren";
    }


    function processAtt_do(ctx, att, atts) {
        var do_ = att.value;//ctx.tmplEl.getAttribute("do");
        var res = evaluate(do_, ctx, ctx.el);
        ctx.el.removeAttribute("do");
        return null;
    }

    function processAtt_if(ctx, att, atts) {
        var tmplEl = ctx.tmplEl;
        var el = ctx.el;
        var condition = att.value;
        ctx.el.removeAttribute("if");
        var res = evaluate(condition, ctx, el);
        if (!res) {
            $(el).remove();
            ctx.el = null;
            return "skipNextAttributesAndChildren";
        }
        return null;
    }

    ///generates elements according to tmplEl.each attribute
    //returns an array of the newly generated elements, null if no 'each' attribute
    //tmplEl: <div class="Friend" each="t.friends"/>
    //el/itemTmpl: <div class="Friend" /> ->
    function processAtt_each(ctx, att, atts) {
        var tmplEl = ctx.tmplEl;
        var el = ctx.el;

        var each = tmplEl.getAttribute("each");
        if (each == null)
            return null;

        var list = evaluate(each, ctx, el);
        if (list == null)
            list = [];

        var itemTmpl = $(tmplEl).data("itemTmpl");
        if (itemTmpl == null) {
            itemTmpl = $(tmplEl).clone().removeAttr("each")[0]; // using tmplEl.clone().removeAttr('each') as template, and tmplEl in ctx to retrace created elements
            ctx.itemTmpl = tmplEl;
            $(tmplEl).data("itemTmpl", itemTmpl);
        }
        var itemEls = [];
        if (ctx.__isUpdate) {
            itemEls = $(el).parent().children().toArray().where(function (ch) {
                var ctx = $(ch).data("ctx");
                if (ctx == null)
                    return false;
                if (ctx.tmplEl == itemTmpl)
                    return true;
                return false;
            });
        }
        var itemEls2 = $(itemEls).generator(function (obj) {
            var itemEl = $(itemTmpl).clone()[0];
            var ctx2 = shallowCopy(ctx);
            ctx2.el = itemEl;
            ctx2.tmplEl = itemTmpl;
            ctx2.parent = ctx;
            ctx2.t = obj;
            process(ctx2);
            return $(ctx2.el).data("ctx", ctx2);
            //return ctx2.el;
        }).zip(list, { autoAdd: false });

        ctx.el = null;
        //itemEls = list.select(function (obj, i) {
        //    var itemEl = $(tmplEl).clone().removeAttr("each")[0];
        //    var ctx2 = shallowCopy(ctx);
        //    ctx2.el = itemEl;
        //    ctx2.tmplEl = tmplEl;
        //    ctx2.parent = ctx;
        //    ctx2.t = obj;
        //    process(ctx2);
        //    $(ctx2.el).data("ctx", ctx2);
        //    return ctx2.el;
        //});

        if (ctx.__isUpdate) {
            //itemEls2.added().forEach(function(ch){
                
            //});
            $(el).parent().append(itemEls2);//.replaceWith(itemEls2);
        }
        else
            $(el).replaceWith(itemEls2);
        ctx.itemEls = itemEls2.toArray();
        //$(el).parent().append($(itemEls));
        return "skipNextAttributesAndChildren";
    }

    function processNextAttributes(ctx, att, atts) {
        var atts2 = atts;
        var index = atts.indexOf(att);
        if (index >= 0)
            atts2 = atts.skip(index + 1);
        var res = processAttributes(ctx, atts2);
        return res;
    }

    function processChildNodes(ctx) {
        var el = ctx.el;
        var tmplEl = ctx.tmplEl;
        var childNodes = Array.from(el.childNodes);
        var tmplChildNodes = Array.from(tmplEl.childNodes);
        childNodes.forEach(function (child, i) {
            var tmplChild = tmplChildNodes[i];
            if (child.nodeType == 3) {
                var text = child.data.trim();
                if (text.length > 0) {
                    var value = evaluate(text, ctx, child);
                    if (value instanceof Element)
                        $(child).replaceWith(value)
                    else
                        child.data = value;
                }
            }
            else if (child.nodeType == 1) {
                var ctx2 = shallowCopy(ctx);
                ctx2.el = child;
                ctx2.tmplEl = tmplChild;
                process(ctx2);
            }
        });
    }

    function evaluate(expr, ctx, self) {
        return _amp._compiler.evaluate(expr, ctx, self);
    }
    function compile(expr, ctx) {
        return _amp._compiler.compile(expr, ctx);
    }

}

function AmpExpressionCompiler() {
    var _this = this;
    Function.addTo(_this, [evaluate, compile, parse, compileExpr]);
    var _compiled = {};
    var _parsed = {};

    function parse(expr) {
        var parsed = _parsed[expr];
        if (parsed !== undefined)
            return parsed;
        if (expr == "" || !expr.contains("{"))
            parsed = [{ type: "text", value: expr }];
        else
            parsed = _parse(expr, [], 0, 0);
        _parsed[expr] = parsed;
        return parsed;
    }


    function findNextExprStart(expr, start) {
        var from = start;
        while (from < expr.length) {
            var open = expr.indexOf("{", from);
            if (open < 0)
                return -1;
            if (open >= from && expr[open - 1] != "\\")
                return open;
            from += 2;
        }
        return -1;
    }

    function isValidExpr(s) {
        try {
            var x = new Function(s);
            if (x == null)
                return false;
            return true;
        }
        catch (e) {
            return false;
        }
    }
    function findExprEnd(expr, open) {
        var from = open + 1;
        while (from < expr.length) {
            var close = expr.indexOf("}", from);
            if (close < 0)
                return -1;
            if (isValidExpr(expr.substring(open + 1, close)))
                return close;
            //if (open >= from && expr.indexOf("}}", from) != open)
            //    return open;
            from += 1;
        }
        return -1;
    }

    function _parse(expr, tokens, index, depth) {
        if (depth == null)
            depth = 1;
        if (tokens == null)
            tokens = [];
        if (index == null)
            index = 0;
        if (depth > 10)
            throw new Error("stack safety");
        if (index >= expr.length)
            return tokens;

        var open = findNextExprStart(expr, index);;
        if (open >= index) {
            var close = findExprEnd(expr, open);
            if (close < open) {
                console.warn("expr syntax error", expr);
                return tokens;
            }
            var exp = expr.substring(open + 1, close);
            if (open > index) {
                var before = expr.substring(index, open);
                tokens.push({ type: "text", value: before });
            }
            tokens.push({ type: "expr", value: exp });
            _parse(expr, tokens, close + 1, depth + 1);
        }
        else if (index == 0) {
            tokens.push({ type: "text", value: unescapeExprText(expr) });
        }
        else {
            tokens.push({ type: "text", value: unescapeExprText(expr.substr(index)) });
        }
        return tokens;
    }
    function unescapeExprText(s) {
        return s.replaceAll("\{", "{").replaceAll("\}", "}");
    }

    function getExprKey(expr, ctx) {
        return [expr].concat(Object.keys(ctx).where(isValidIdentifier)).join("\t");
    }
    function compile(expr, ctx) {
        var key = getExprKey(expr, ctx);
        var func = _compiled[key];
        if (func !== undefined)
            return func;
        func = _compile(expr, ctx);
        _compiled[key] = func;
        return func;
    }
    function _compile(expr, ctx) {
        var tokens = parse(expr);
        var nodes = tokens.select(emitToken);
        var expr2;
        if (nodes.length == 1) {
            expr2 = nodes[0];
        }
        else if (tokens.firstEq("type", "text") != null) {
            expr2 = "[" + nodes.join(",") + "].join('')";
        }
        else {
            expr2 = "[" + nodes.join(",") + "]";
        }
        var func = compileExpr(expr2, ctx);
        return func;
    }

    function emitToken(token) {
        if (token.type == "text") {
            return JSON.stringify(token.value);
        }
        else if (token.type == "expr") {
            return token.value;
        }
        else {
            console.warn("unknown token type", token);
        }
    }
    function evaluate(expr, ctx, self) {
        var func = compile(expr, ctx);
        if (self === undefined)
            self = expr.this;
        return func.call(self, ctx);
    }

    function isValidIdentifier(s) {
        return /[a-zA-Z_]+[a-zA-Z0-9]*/.test(s);
    }
    function compileExpr(expr, ctx) {
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



}
$.fn.triggerEvent = function (name, props) {
    return this.trigger($.Event(name, props));
}
