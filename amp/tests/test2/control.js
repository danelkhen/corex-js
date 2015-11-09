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
        if(_opts.append!=null)
            return _opts.append(list);
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
Control.append = function(obj, children) {
    var ctl = Control.from(obj);
    ctl.append(children);
    return ctl;
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

Element.prototype.setChildren = function (list) {
    var childNodes = toNodes(list);
    HierarchyUtils.setChildren(this, childNodes);
    return this;
}


