"use strict"
function HControl(node) {
    var _this = this;
    var _node = node;
    Function.addTo(_this, [
        create, invisible, repeater, changeContext, twoColumns, external,
        repeater2, content, vertical, horizontal, verify, setChildResults,
        conditional, switcher, bindVal, field, define
    ]);
    Object.forEach(HControl.prototype, (key, value) => {
        if (typeof (value) == "function")
            _this[key] = value.bind(_this);
    });

    var _htmlTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];

    main();
    Object.defineProperties(_this, {
        el: { get: function () { return _node.lastRes; } }
    });

    //function input(){
    //    console.log("input");
    //    return $.create("input");
    //}

    function main() {
        _htmlTags.forEach(function (tag) {
            if (_this[tag] != null)
                return;
            var func = function (opts) {
                return verify(tag, opts);
            };
            var funcName = tag;
            if (funcName == "var")
                funcName = "var_";

            _this[funcName] = func;
        });
    }
    function verify(selector, opts) {
        var existing = _node.lastRes;
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
                if(key=="each")
                    return;
                if (key.startsWith("on")) {
                    var name = key.substr(2) + ".hcontrol";
                    el.off(name).on(name, opts[key]);
                }
                else {
                    var func = el[key];
                    if (typeof (func) == "function")
                        el = el[key](opts[key]);
                    else
                        el.prop(key, opts[key]);
                }
            });
        }
        return el;
        //var el2 = el[0];
        //return el2;
    }
    function create(selector, opts) {
        var el = $.create(selector);
        if (opts) {
            Object.keys(opts).forEach(function (key) {
                el = el[key](opts[key]);
            });
        }
        return el;
        //var el2 = el[0];
        //return el2;
    }
    function invisible() {
        _node.tunnelCtx();
        _node.childrenProcessed = true;
        return $(_node.children.select(child=>child.process())).toChildNodes();
    }


    function cloneNodes(nodes) {
        return nodes.select(t=>t.clone);
    }
    function repeater(list, opts) {
        var node = _node;
        var el = _node.lastRes || $();
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
                cloned.forEach(t=>t.bindArgs([obj]));
                map.set(obj, cloned);
            }
            else {
                //console.log("already exists!", cloned);
            }
            var x = cloned.select(child=>child.process());
            var xx = $(x).toChildNodes();
            xx.addClass("rpt-" + i);
            return xx;
        }
        var res2 = list.selectMany(template);
        var res3 = $(res2);
        return res3;
    }


    function conditional(condition) {
        if (!condition) {
            _node.childrenProcessed = true;
            return null;
        }
        return invisible();
    }

    function first() {
        _node.childrenProcessed = true;
        if (index == null)
            return null;
        var child = _node.children[index];
        if (child == null)
            return null;
        _node.tunnelCtx([child]);
        return child.process();
    }
    function switcher(index) {
        _node.childrenProcessed = true;
        if (index == null)
            return null;
        var child = _node.children[index];
        if (child == null)
            return null;
        _node.tunnelCtx([child]);
        return child.process();
    }

    function repeater2(el, list, opts) {
        var node = el.node;
        node.childrenProcessed = true;
        if (list == null)
            list = [];

        var template = function (obj, i) {
            cloned = node.children.select(t=>t.clone());
            cloned.forEach(t=>t.bindArgs([obj]));
            var x = cloned.selectMany(child=>child.process().toArray());
            return x;
        }
        var res2 = list.selectMany(template);
        var res3 = $(res2);
        return res3;
    }

    function external(ctl, data) {
        var node = _node;
        node.childrenProcessed = true;
        node.tunnelCtx();
        var externalNode = node.externalNode;
        if (externalNode == null) {
            externalNode = compileFakeFunction(ctl);// loadTemplate(ctl);
            node.externalNode = externalNode;
            //externalNode.el = el;
        }
        if (data != null)
            externalNode.bindPrms(data);
        externalNode.ctx._content = node.children;
        var el2 = externalNode.process();
        //el2.externalNode = externalNode;
        return el2;
    }

    function content() {
        return _node.ctx._content.selectMany(t=>t.process());
    }

    function twoColumns() {
        var node = _node;
        node.childrenProcessed = true;
        node.tunnelCtx();
        var children = $(node.children.select(t=>t.process())).toChildNodes().toArray();
        var pairs = toPairs(children);
        var div = _node.lastRes || $();
        div = div.verify("table").getAppend("tbody");
        div.getAppendRemoveForEach("tr", pairs, function (row, pair) {
            row.getAppendRemoveForEach("td", pair, function (cell, child) {
                cell.append(child);
            });
        });
        return div;
    }

    function toPairs(list) {
        var list2 = [];
        for (var i = 0; i < list.length; i += 2) {
            list2.push([list[i], list[i + 1]]);
        }
        return list2;
    }

    function vertical() {
        var node = _node;
        console.log("vetrical", this);
        //var node = el.node;
        node.childrenProcessed = true;
        node.tunnelCtx();
        if (node.children.length == 0)
            return el.empty();
        var el = node.lastRes || $();
        el = el.verify("table.layout.vertical");
        var tbl = el;
        var tbody = tbl.getAppend("tbody");
        var results = node.children.select(t=>t.process());
        tbody.getAppendRemoveForEach("tr", results, function (tr, res) {
            var td = tr.getAppend("td");
            var childNodes = $(toNodes(res));
            var height = childNodes.data("layout-height");
            if (height == null)
                height = childNodes.data("layout-size");
            if (height != null)
                td.css({ height: height });
            td.setChildNodes(childNodes);
        });
        return el;
    }

    function horizontal() {
        var node = _node;
        var el = _node.lastRes || $();
        node.childrenProcessed = true;
        node.tunnelCtx();
        if (node.children.length == 0)
            return el.empty();
        el = el.verify("table.layout.horizontal");
        var tbl = el;
        var tr = tbl.getAppend("tbody").getAppend("tr");
        var results = node.children.select(t=>t.process());
        tr.getAppendRemoveForEach("td", results, function (td, res) {
            var childNodes = $(toNodes(res));
            var width = childNodes.data("layout-width");
            if (width == null)
                width = childNodes.data("layout-size");
            if (width != null)
                td.css({ width: width });
            td.setChildNodes(childNodes);
        });
        return el;
    }


    function field(name) {
        var label = $.create("label").text(name + ": ");
        var input = bindVal($.create("input"), name);
        return $([label[0], input[0]]);
    }
    function bindVal(el, name) {
        var obj = getDataContext() || {};
        var el2 = $(el);
        el2.off("change.bindVal").on("change.bindVal", e => obj[name] = $(e.target).val());
        el2.val(obj[name]);
        return el2;
    }

    function define(func){
        var fi = FunctionHelper.parse(func.toString());
        fi.prms.forEach(function(prm){
            _node.ctx[prm] = func();
        });
        return invisible();
    }

    function getDataContext() {
        var prms = getLastPrms();
        var obj;
        if (prms != null && prms.length > 0)
            return _node.ctx[prms[0]];
        return null;
    }

    function getLastPrms() {
        var node = _node;
        while (node != null) {
            if (node.funcPrms != null && node.funcPrms.length > 0) {
                return node.funcPrms;
            }
            node = node.parent;
        }
        return _node.funcPrms;
    }

    function changeContext(newContext) {
        return {
            setTemplate: function (templateFunc) {
                var children = templateFunc(newContext);
                return children;
            }
        }
    }

    function setChildResults(parentRes, childResults) {
        var parentEl2 = toNodes(parentRes)[0];
        var childNodes2 = toNodes(childResults);
        HierarchyUtils.setChildren(parentEl2, childNodes2);
    }

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
$.fn.toChildNodes = function () {
    return this.pushStack(toNodes(this));
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
Node.prototype.setChildNodes = function (childNodes) {
    HierarchyUtils.setChildren(this, childNodes);
}


//var _hierarchyControl = new HierarchyControl();
//$.fn.repeater = function (list, opts) {
//    return _hierarchyControl.repeater(this, list, opts);
//}
//$.fn.columnar = function () {
//    return _hierarchyControl.columnar(this);
//}
//$.fn.external = function (name, data) {
//    return _hierarchyControl.external(this, name, data);
//}
//function vertical(el) {
//    var node = el.node;
//    node.childrenProcessed = true;
//    node.tunnelCtx();
//    //if (node.children.length == 0)
//    //    return el.empty();
//    el = el.verify("div.vertical");
//    //var tbl = el;
//    //var tbody = tbl.getAppend("tbody");
//    var children2 = node.children.select(t=>t.process());
//    //children2.forEach(t=>t.addClass())
//    el.setChildNodes(toNodes(children2));
//    //tbody.getAppendRemoveForEach("tr", children2, function (tr, child) {
//    //    var td = tr.getAppend("td");
//    //    td.setChildNodes(toNodes([child]));
//    //});
//    return el;
//}
