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
    HierarchyUtils.setChildren(this[0], childNodes);
    return this;
}
Node.prototype.setChildNodes = function (childNodes) {
    HierarchyUtils.setChildren(this, childNodes);
}

function HNode(_node) {
    if (this == null || this == window)
        return new HNode(_node);
    var _this = this;
    _this._children = _node.children.select(t=>new HNode(t));
    _this._text = _node.text;
    var _ctx = _node.ctx;
    var _prms, _lastCtx;
    var _func = _node.func;
    if (_node.funcInfo != null)
        _prms = _node.funcInfo.argNames.toArray();
    else
        _prms = [];

    Object.defineProperties(_this, {
        children: { get: function () { return _this._children; } },
        ctx: { get: function () { return _ctx; }, set: function (value) { _ctx = value; } },
        prms: { get: function () { return _prms; } },
    });

    Function.addTo(_this, [process, bindPrms, clone]);

    function clone() {
        var cloned = new HNode(_node);
        cloned.ctx = shallowCopy(_ctx);
        return cloned;
    }

    function bindPrms() {
        var values = Array.from(arguments);
        values.forEach((value, i) => _ctx[_prms[i]] = value);
        return _this;
    }

    function canReuseLastRes() {
        if (_lastCtx == null)
            return false;
        var lastKeys = Object.keys(_lastCtx);
        var keys = Object.keys(_ctx);
        if (lastKeys.length != keys.length)
            return false;
        lastKeys = lastKeys.orderBy(t => t);
        keys = lastKeys.orderBy(t => t);
        if (!lastKeys.itemsEqual(keys))
            return false;
        if (!keys.all(key => _lastCtx[key] == _ctx[key]))
            return false;
        return true;
    }

    function invoke() {
        if (canReuseLastRes())
            return _this._lastRes;
        var res = _func(_ctx);
        _this._lastRes = res;
        _lastCtx = shallowCopy(_ctx);
        return res;
    }

    function process() {
        var res = invoke();
        _this._children.forEach(t=>shallowCopy(_ctx, t.ctx));
        if (res == null)
            return res;
        if (res.processChildren) {
            var childrenRes = res.processChildren(_this);
            _this.lastChildrenRes = childrenRes;
            return childrenRes;
        }
        var childNodes = _this._children.select(t=>t.process());
        res.setChildNodes(flattenResults(childNodes));
        return res;
    }

    function flattenResults(results) {
        var list = [];
        results.forEach(function (res) {
            if (res instanceof Array)
                list.addRange(res);
            else
                list.add(res);
        });
        return list;
    }

    function shallowCopy(src, dest) {
        return $.extend(dest || {}, src);
    }

}

//function HierarchyProcessor(_opts) {
//    var _this = this;
//    Function.addTo(_this, [process]);

//    main();
//    var _nodes, _cache, _rootEl, _root;
//    function main() {
//        _nodes = _opts.nodes.select(HNode);
//        _root = _nodes[0];
//        _cache = _opts.cache;
//        //_rootEl = _opts.rootEl;
//        //if (_rootEl != null)
//        //    _root = function () { return { func: function (t) { return existing(_rootEl); }, childNodes: _nodes }; };
//        //else if (_nodes.length == 1)
//        //    _root = _nodes[0];
//        //else
//        //    _root = { func: function (t) { return { setChildren: function (children) { return children; } } }, childNodes: _nodes };
//        ////if (_cache)
//        ////    addCaching(_root);
//    }

//    function process(data) {
//        _root.ctx.data = data;
//        return _root.process();
//        //return processNode(_root);
//    }


//    function existing(selector, opts) {
//        var el = $(selector);
//        if (opts) {
//            Object.keys(opts).forEach(function (key) {
//                el = el[key](opts[key]);
//            });
//        }
//        var el2 = el[0];
//        return {
//            setChildren: function (children) {
//                return HierarchyUtils.setChildren(el2, children);
//            }
//        }
//    }



//    function cached1(func) {
//        if (typeof (func) != "function")
//            throw new Error();
//        var map = new Map();
//        return function (prm) {
//            if (map.has(prm))
//                return map.get(prm);
//            var res = func(prm);
//            map.set(prm, res);
//            return res;
//        };
//    }

//    function addCaching(node) {
//        if (node._cached)
//            return;
//        node.func = cached1(node.func);
//        //node.childNodes.forEach(addCaching);
//        node._cached = true;
//    }


//    function processChildNodes(node) {
//        var childEls = [];
//        node.children.forEach(function (child) {
//            var ch = processNode(child);
//            if (ch instanceof Array)
//                childEls.addRange(ch);
//            else
//                childEls.add(ch);
//        });
//        return childEls;
//    }

//    function processNode(node) {
//        if (_opts.cache) {
//            addCaching(node);
//        }
//        var parent = node.func(node.ctx);
//        var res;
//        if (parent == null) {
//            res = null;
//        }
//        else if (parent.setTemplate) {
//            res = parent.setTemplate(function (t) {
//                node.children.forEach(function (child) {
//                    if (child.funcInfo != null)
//                        child.ctx[child.funcInfo.argNames[0]] = t;
//                });
//                return processChildNodes(node);
//            });
//        }
//        else if (parent.setChildren) {
//            node.children.forEach(t=>t.ctx = node.ctx);
//            var children = processChildNodes(node);
//            res = parent.setChildren(children);
//        }
//        else {
//            node.children.forEach(t=>t.ctx = node.ctx);
//            var children = processChildNodes(node);
//            res = HierarchyUtils.setChildren(parent, children);
//        }
//        return res;
//    }

//}