"use strict";
function jQueryHelper() {
    var _svgElements = { altGlyph: 1, altGlyphDef: 1, altGlyphItem: 1, animate: 1, animateColor: 1, animateMotion: 1, animateTransform: 1, circle: 1, clipPath: 1, "color-profile": 1, cursor: 1, defs: 1, desc: 1, ellipse: 1, feBlend: 1, feColorMatrix: 1, feComponentTransfer: 1, feComposite: 1, feConvolveMatrix: 1, feDiffuseLighting: 1, feDisplacementMap: 1, feDistantLight: 1, feFlood: 1, feFuncA: 1, feFuncB: 1, feFuncG: 1, feFuncR: 1, feGaussianBlur: 1, feImage: 1, feMerge: 1, feMergeNode: 1, feMorphology: 1, feOffset: 1, fePointLight: 1, feSpecularLighting: 1, feSpotLight: 1, feTile: 1, feTurbulence: 1, filter: 1, font: 1, "font-face": 1, "font-face-format": 1, "font-face-name": 1, "font-face-src": 1, "font-face-uri": 1, foreignObject: 1, g: 1, glyph: 1, glyphRef: 1, hkern: 1, image: 1, line: 1, linearGradient: 1, marker: 1, mask: 1, metadata: 1, "missing-glyph": 1, mpath: 1, path: 1, pattern: 1, polygon: 1, polyline: 1, radialGradient: 1, rect: 1, script: 1, set: 1, stop: 1, style: 1, svg: 1, "switch": 1, symbol: 1, text: 1, textPath: 1, title: 1, tref: 1, tspan: 1, use: 1, view: 1, vkern: 1, };
    Function.addTo(jQueryHelper, [parseSelector, createElementFromSelectorNode, getOrAppendChildBySelector, createElementFromSelector]);

    function parseSelector(s) {
        var sizzle = jQuery.find;
        var groups = sizzle.tokenize(s);
        return groups;
    }

    function createElementFromSelector(selector) {
        var nodes = parseSelector(selector);
        return createElementFromSelectorNode(nodes[0]);
    }
    function createElementFromSelectorNode(node) {
        var tagName = "div";
        var tagToken = node.first(function (t) { return t.type == "TAG"; });
        if (tagToken != null)
            tagName = tagToken.value;

        var idToken = node.first(function (t) { return t.type == "ID"; });
        var isSvg = _svgElements[tagName];
        var el;
        if (isSvg)
            el = $(document.createElementNS("http://www.w3.org/2000/svg", tagName));
        else
            el = $("<" + tagName + "/>");
        if (idToken != null)
            el.attr("id", idToken.value.substr(1));

        var atts = node.whereEq("type", "ATTR").select(function (t) { return t.value.substr(1, t.value.length - 2).split('='); });
        if (atts.length > 0) {
            atts.forEach(function (att) {
                el.attr(att[0], att[1]);
            });
        }

        var classes = node.whereEq("type", "CLASS").select(function (t) { return t.value.substr(1); });
        if (classes.length > 0) {
            if(isSvg)
                el.attr("class", classes.join(" "));
            else
                el.addClass(classes.join(" "));
        }

        return el;
    }

    function getOrAppendChildBySelector(parentEl, selector, options) {
        var childEls = parentEl.children(selector).toArray();
        var total = null;
        var list = null;
        var action = null;
        var storeDataItem = false;
        var removeRemaining = false;
        var create;
        var destroy;
        if (options != null) {
            if (options.total != null)
                total = options.total;
            if (options.list != null) {
                list = options.list;
                if (total == null)
                    total = list.length;
            }
            action = options.action;
            storeDataItem = options.storeDataItem;
            removeRemaining = options.removeRemaining;
            create = options.create;
            destroy = options.destroy;
        }
        if (total == null)
            total = 1;

        var index = childEls.length;

        if (action != null || storeDataItem) {
            var min = Math.min(index, total);
            if (list == null)
                list = [];
            for (var i = 0; i < min; i++) {
                var child = $(childEls[i]);
                var dataItem = list[i];
                if (storeDataItem)
                    child.dataItem(dataItem);
                if (action != null)
                    action(child, dataItem, index);
            }
        }
        if (index < total) {
            var selectorNodes = parseSelector(selector);
            if (selectorNodes.length != 1)
                throw new Error();
            var selectorNode = selectorNodes[0];
            while (index < total) {
                var dataItem = list != null ? list[index] : null;
                var child = create ? create(dataItem, index) : createElementFromSelectorNode(selectorNode);
                var childEl = child[0];
                parentEl.append(childEl);
                childEls.push(childEl);
                if (storeDataItem)
                    child.dataItem(dataItem);
                if (action != null)
                    action(child, dataItem, index);
                index++;
            }
        }
        if (removeRemaining) {
            while (childEls.length > total) {
                var parentEl = childEls.pop();
                if (destroy)
                    destroy(parentEl);
                $(parentEl).remove();
            }
        }
        return $(childEls);
    }
}
jQueryHelper();

jQuery.fn.getAppend = function (selector, options) {
    return jQueryHelper.getOrAppendChildBySelector(this, selector, options);
}
jQuery.fn.getAppendRemove = function (selector, total) {
    if (typeof (total) == "boolean")
        total = total ? 1 : 0;
    return jQueryHelper.getOrAppendChildBySelector(this, selector, { total: total, removeRemaining: true });
}
jQuery.fn.getAppendRemoveForEach = function (selector, list, action, options) {
    if (options == null)
        options = {};
    options.list = list;
    options.action = action;
    options.removeRemaining = true;
    return jQueryHelper.getOrAppendChildBySelector(this, selector, options);
}
jQuery.create = function (selector) {
    return jQueryHelper.createElementFromSelector(selector);
}

//binds a container's children selector to a list, matching the number of elements to the list.length (creating/deleting elements where needed), optionally performing action(el, dataItem, index) on each element
//returns a new jQuery object containing all children relevant to the selector
jQuery.fn.bindChildrenToList = function (selector, list, action, options) {
    if (options == null)
        options = {};
    options.list = list;
    options.action = action;
    options.storeDataItem = true;
    options.removeRemaining = true;
    return jQueryHelper.getOrAppendChildBySelector(this, selector, options);
}

jQuery.fn.dataItem = function (value) {
    if(arguments.length>0)
        return this.data("DataItem", value);
    return this.data("DataItem");
}

//Turns a jquery object to an array of single jquery objects
jQuery.fn.toArray$ = function (action) {
    var list = [];
    for (var i = 0; i < this.length; i++)
        list.push($(this[i]));
    return list;
}

//Turns an array of jquery objects to a single jquery object
jQuery.fromArray$ = function (list) {
    return $(list.selectMany(function (j) { return j.toArray(); }));
}
