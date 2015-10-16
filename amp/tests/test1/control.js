function HierarchyControl() {
    var _this = this;
    Function.addTo(_this, [create, invisible, repeater, changeContext, columnar, external, repeater2]);

    var _htmlTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    //["!--...--","!DOCTYPE ",

    main();


    function main() {
        _htmlTags.forEach(function (tag) {
            if (_this[tag] != null)
                return;
            var func = function (el, opts) { return verify(el, tag, opts); };
            var funcName = tag;
            if (funcName == "var")
                funcName = "var_";

            _this[funcName] = func;
        });
    }
    function verify(existing, selector, opts) {
        var el;
        if (existing != null) {
            el = $(existing);
            if (!el.is(selector))
                el = null;
        }
        if (el == null)
            el = $.create(selector);
        if (opts) {
            Object.keys(opts).forEach(function (key) {
                el = el[key](opts[key]);
            });
        }
        var el2 = el[0];
        return el2;
    }
    function create(selector, opts) {
        var el = $.create(selector);
        if (opts) {
            Object.keys(opts).forEach(function (key) {
                el = el[key](opts[key]);
            });
        }
        var el2 = el[0];
        return el2;
    }
    function invisible(opts) {
        return {
            processChildren: function (node) {
                return node.children.selectMany(child=>child.process());
            }
        };
    }


    function cloneNodes(nodes) {
        return nodes.select(t=>t.clone);
    }
    function repeater(el, list, opts) {
        var node = el.node;
        var map = node.__map;
        if (map == null) {
            map = new Map();
            node.__map = map;
        }
        node.childrenProcessed = true;
        if (list == null)
            list = [];

        var template = function (obj, i) {
            var cloned = map.get(obj);
            if (cloned == null) {
                cloned = node.children.select(t=>t.clone());
                cloned.forEach(t=>t.bindPrms(obj));
                map.set(obj, cloned);
            }
            else {
                //console.log("already exists!", cloned);
            }
            var x = cloned.selectMany(child=>child.process().toArray());
            $(x).addClass("rpt-" + i);
            return x;
        }
        var res2 = list.selectMany(template);
        var res3 = $(res2);
        return res3;
    }

    function repeater2(el, list, opts) {
        var node = el.node;
        node.childrenProcessed = true;
        if (list == null)
            list = [];

        var template = function (obj, i) {
            cloned = node.children.select(t=>t.clone());
            cloned.forEach(t=>t.bindPrms(obj));
            var x = cloned.selectMany(child=>child.process().toArray());
            return x;
        }
        var res2 = list.selectMany(template);
        var res3 = $(res2);
        return res3;
    }

    function external(el, ctl, data) {
        var externalNode = el.externalNode;
        if (externalNode == null) {
            var node = el.node;
            externalNode = loadTemplate(ctl);
            externalNode.el = el;
        }
        if (data != null)
            externalNode.bindPrms(data);
        var el2 = externalNode.process();
        el2.externalNode = externalNode;
        return el2;
    }

    function columnar(el) {
        var node = el.node;
        node.childrenProcessed = true;
        node.tunnelCtx();
        var children = node.children.select(t=>t.process());
        el = el.verify(".row");
        el.getAppendRemoveForEach(".col-md-4", children, function (div, child) {
            div.append(child);
        });
        return el;
    }

    function changeContext(newContext) {
        return {
            setTemplate: function (templateFunc) {
                var children = templateFunc(newContext);
                return children;
            }
        }
    }

}
var _hierarchyControl = new HierarchyControl();
$.fn.repeater = function (list, opts) {
    return _hierarchyControl.repeater(this, list, opts);
}

$.fn.columnar = function () {
    return _hierarchyControl.columnar(this);
}
$.fn.external = function (name, data) {
    return _hierarchyControl.external(this, name, data);
}
