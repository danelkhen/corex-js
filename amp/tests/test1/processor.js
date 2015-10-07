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

function HierarchyProcessor(_opts) {
    var _this = this;
    Function.addTo(_this, [process]);

    main();
    var _nodes, _cache, _rootEl, _root;
    function main() {
        _nodes = _opts.nodes;
        _cache = _opts.cache;
        _rootEl = _opts.rootEl;
        if (_rootEl != null)
            _root = { func: function (t) { return existing(_rootEl); }, childNodes: _nodes };
        else
            _root = { func: function (t) { return { setChildren: function (children) { return children; } } }, childNodes: _nodes };
        if (_cache)
            addCaching(_root);
    }

    function process(data) {
        return processNode(_root, data);
    }


    function existing(selector, opts) {
        var el = $(selector);
        if (opts) {
            Object.keys(opts).forEach(function (key) {
                el = el[key](opts[key]);
            });
        }
        var el2 = el[0];
        return {
            setChildren: function (children) {
                return HierarchyUtils.setChildren(el2, children);
            }
        }
    }



    function cached1(func) {
        var map = new Map();
        return function (prm) {
            if (map.has(prm))
                return map.get(prm);
            var res = func(prm);
            map.set(prm, res);
            return res;
        };
    }

    function addCaching(node) {
        node.func = cached1(node.func);
        node.childNodes.forEach(addCaching);
    }


    function processChildNodes(node, data) {
        var childEls = [];
        node.childNodes.forEach(function (child) {
            var ch = processNode(child, data);
            if (ch instanceof Array)
                childEls.addRange(ch);
            else
                childEls.add(ch);
        });
        return childEls;
    }

    function processNode(node, data) {
        var parent = node.func(data);
        var res = parent;
        if (parent == null) {
            res = processChildNodes(node, data);
        }
        else if (parent.setTemplate) {
            res = parent.setTemplate(function (t) { return processChildNodes(node, t); });
        }
        else if (parent.setChildren) {
            var children = processChildNodes(node, data);
            res = parent.setChildren(children);
        }
        else {
            var children = processChildNodes(node, data);
            res = HierarchyUtils.setChildren(parent, children);
        }
        return res;
    }

}