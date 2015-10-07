function HierarchyControl() {
    var _this = this;
    Function.addTo(_this, [create, invisible, repeater]);

    var _htmlTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1","h2","h3","h4","h5","h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    //["!--...--","!DOCTYPE ",

    main();


    function main() {
        _htmlTags.forEach(function (tag) {
            if (_this[tag] != null)
                return;
            var func = create.bind(this, tag);
            var funcName = tag;
            if(funcName=="var")
                funcName = "var_";

            _this[funcName] = func;
        });
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
        return null;
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
