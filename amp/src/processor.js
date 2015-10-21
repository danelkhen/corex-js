"use strict"
function HNode(_node, _parent, _root) {
    if (this == null || this == window)
        return new HNode(_node, root);
    var _this = this;
    var _text, _childrenProcessed, _ctx, _funcPrms, _lastCtx, _funcGen, _func, _children, _nodeProcessorGen, _nodeProcessor, _lastRes;

    Object.defineProperties(_this, {
        parent: { get: function () { return _parent; }, set: function (value) { _parent = value; } },
        children: { get: function () { return _children; }, set: function (value) { _children = value; } },
        ctx: { get: function () { return _ctx; }, set: function (value) { _ctx = value; } },
        funcPrms: { get: function () { return _funcPrms; }, set: function (value) { _funcPrms = value; } },
        lastRes: { get: function () { return _lastRes; } },
        func: { get: function () { return _func; }, set: function (value) { _func = value; } },
        funcGen: { get: function () { return _funcGen; }, set: function (value) { _funcGen = value; } },
        nodeProcessor: { get: function () { return _nodeProcessor; }, set: function (value) { _nodeProcessor = value; } },
        nodeProcessorGen: { get: function () { return _nodeProcessorGen; }, set: function (value) { _nodeProcessorGen = value; } },
        childrenProcessed: { get: function () { return _childrenProcessed; }, set: function (value) { _childrenProcessed = value; } },
    });

    Function.addTo(_this, [process, bindArgs, clone, tunnelCtx, invoke]);
    main();

    function main() {
        if (_root == null)
            _root = _this;
        if (_node == null)
            _node = {};
        _text = _node.text;
        _ctx = shallowCopy(_node.ctx);
        _nodeProcessorGen = _node.nodeProcessorGen || _root.nodeProcessorGen;
        _funcGen = _node.funcGen;
        _funcPrms = _node.funcPrms;
        _func = _node.func;
        _nodeProcessor = _nodeProcessorGen(_this);
        if (_func == null) {
            //console.log("compiling", _text);
            if (_funcGen == null && _node.funcBody) {
                var compiler = new HierarchyCompiler();
                _funcGen = compiler.compileGenFunc(_node.funcBody, _ctx, _nodeProcessor);
            }
            if (_funcGen != null) {
                _nodeProcessorGen();
                _func = _funcGen(_nodeProcessor);
            }
        }

        if (_node.children != null)
            _children = _node.children.select(t=>new HNode(t, _this, _root));
    }

    function invoke(args) {
        bindArgs(args);
        var res = process();
        return res;
    }

    function clone() {
        var cloned = new HNode(_this, _parent, _root);
        cloned.ctx = shallowCopy(_ctx);
        cloned.ctx.el = null; //TODO: clone the res? keep the res?
        cloned.isClone = true;
        return cloned;
    }

    function bindArgs(args) {
        args.forEach((arg, i) => _ctx[_funcPrms[i]] = arg);
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
        //if (_ctx.el == null)//_lastCtx 
        //    _ctx.el = $();
        //_ctx.el.node = _this;
        _ctx.node = _this;
        _childrenProcessed = false;
        var el = _func.call(_this, _ctx);
        _lastRes = el;
        _ctx.el = el;
        _lastCtx = shallowCopy(_ctx);
        return el;
    }

    function tunnelCtx() {
        var ctx = shallowCopy(_ctx);
        delete ctx.el;
        _children.forEach(t=>shallowCopy(ctx, t.ctx));
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
        else if (_children.length > 0) {
            var childResults = _children.select(t=>t.process());
            _nodeProcessor.setChildResults(res, childResults);
        }
        return res;
    }


    function shallowCopy(src, dest) {
        return $.extend(dest || {}, src);
    }

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
//function localizeGlobalCtx() {
//    if (_globalCtx == null)
//        return;
//    _localCtx = {};
//    Object.keys(_globalCtx).forEach(key=> {
//        var value = _globalCtx[key];
//        if (typeof (value) == "function")
//            value = value.bind(_this);
//        _localCtx[key] = value;
//    });
//}
