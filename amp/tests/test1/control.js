function HierarchyControl() {
    var _this = this;
    Function.addTo(_this, [create, input, label, div, invisible, repeater]);

    function create(selector, opts) {
        var el = $.create(selector);
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
    function input(opts) {
        return create("input", opts);
    }
    function label(opts) {
        return create("label", opts);
    }
    function div(opts) {
        return create("div", opts);
    }
    function invisible(opts) {
        return {
            setChildren: function (children) {
                return children;
            }
        };
    }
    function repeater(list, opts) {
        return {
            setTemplate: function (templateFunc) {
                return list.selectMany(function (obj) {
                    var children = templateFunc(obj);
                    return children;
                });
            }
        };
    }
}
