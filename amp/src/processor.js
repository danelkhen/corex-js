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
    return list;
}
function _addNodes(res, list) {
    if (res == null)
        return;
    if (res instanceof Array)
        res.forEach(t=>_addNodes(t, list));
    else if (res instanceof jQuery)
        list.addRange(res.toArray());
    else if (typeof (res) == "string")
        list.add(document.createTextNode(res));
    else
        list.add(res);
}

//$.fn.verify2 = function(list, create) {
//    var childEls = this.toArray();
//    var total = null;
//    var list = null;
//    var action = null;
//    var storeDataItem = false;
//    var removeRemaining = false;
//    var create;
//    var destroy;
//    if (options != null) {
//        if (options.total != null)
//            total = options.total;
//        if (options.list != null) {
//            list = options.list;
//            if (total == null)
//                total = list.length;
//        }
//        action = options.action;
//        storeDataItem = options.storeDataItem;
//        removeRemaining = options.removeRemaining;
//        create = options.create;
//        destroy = options.destroy;
//    }
//    if (total == null)
//        total = 1;

//    var index = childEls.length;

//    if (action != null || storeDataItem) {
//        var min = Math.min(index, total);
//        if (list == null)
//            list = [];
//        for (var i = 0; i < min; i++) {
//            var child = $(childEls[i]);
//            var dataItem = list[i];
//            if (storeDataItem)
//                child.dataItem(dataItem);
//            if (action != null)
//                action(child, dataItem, index);
//        }
//    }
//    if (index < total) {
//        var selectorNode = selectorNodes[0];
//        while (index < total) {
//            var dataItem = list != null ? list[index] : null;
//            var child = create(dataItem, index);
//            var childEl = child[0];
//            //parentEl.append(childEl);
//            childEls.push(childEl);
//            if (storeDataItem)
//                child.dataItem(dataItem);
//            if (action != null)
//                action(child, dataItem, index);
//            index++;
//        }
//    }
//    if (removeRemaining) {
//        while (childEls.length > total) {
//            var parentEl = childEls.pop();
//            if (destroy)
//                destroy(parentEl);
//            $(parentEl).remove();
//        }
//    }
//    return $(childEls);
//}


Node.prototype.setChildNodes = function (childNodes) {
    HierarchyUtils.setChildren(this, childNodes);
}

function HNode(_node) {
    if (this == null || this == window)
        return new HNode(_node);
    var _this = this;
    if (_node == null)
        _node = {};
    if (_node.children != null)
        _this._children = _node.children.select(t=>new HNode(t));
    _this._text = _node.text;
    var _childrenProcessed;
    var _ctx = shallowCopy(_node.ctx);
    var _prms, _lastCtx;

    var _func = _node.func;
    if (_func == null && _node.funcGen != null)
        _func = _node.funcGen.call(this, _node.globalCtx);
    if (_node.funcInfo != null)
        _prms = _node.funcInfo.argNames.toArray();
    else
        _prms = [];

    Object.defineProperties(_this, {
        children: { get: function () { return _this._children; }, set: function (value) { _this._children = value; } },
        ctx: { get: function () { return _ctx; }, set: function (value) { _ctx = value; } },
        prms: { get: function () { return _prms; } },
        lastRes: { get: function () { return _lastRes; } },
        func: { get: function () { return _func; }, set: function (value) { _func = value; } },
        childrenProcessed: { get: function () { return _childrenProcessed; }, set: function (value) { _childrenProcessed = value; } },
    });

    Function.addTo(_this, [process, bindPrms, clone, tunnelCtx]);

    //function localizeGlobalCtx(){
    //    if(_ctx.global==null)
    //        return;
    //    var obj = _ctx.global;

    //}

    function clone() {
        var cloned = new HNode(_node);
        cloned.ctx = shallowCopy(_ctx);
        cloned.ctx.el = null; //TODO: clone the res? keep the res?
        cloned.isClone = true;
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
        if (_node.type == "Comment")
            return el;
        //if (canReuseLastRes())
        //    return _this._lastRes;
        if (_ctx.el == null)//_lastCtx 
            _ctx.el = $();
        _ctx.el.node = _this;
        _ctx.node = _this;
        _childrenProcessed = false;
        var el = _func.call(_this, _ctx);
        _this._lastRes = el;
        _ctx.el = el;
        _lastCtx = shallowCopy(_ctx);
        return el;
    }

    function tunnelCtx() {
        var ctx = shallowCopy(_ctx);
        delete ctx.el;
        _this._children.forEach(t=>shallowCopy(ctx, t.ctx));
    }
    function process() {
        if (_node.type == "Comment")
            return null;
        //console.log("processing: " + Array(_node.tab).join(" ")+ _node.text);
        var res = invoke();
        tunnelCtx();
        if (res == null)
            return res;
        if (_childrenProcessed) {
            var childrenRes = res;//.processChildren(_this);
            //_ctx.res = childrenRes;
            _this.lastChildrenRes = childrenRes;
            return childrenRes;
        }
        else if (_this._children.length > 0) {
            var childNodes = _this._children.select(t=>t.process());
            var childNodes2 = toNodes(childNodes);
            res.setChildNodes(childNodes2);
        }
        return res;
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