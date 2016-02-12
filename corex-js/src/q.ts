"use strict";
class Q {
    ///<summary>Copies an object into a target object,
    ///recursively cloning any native json object or array on the way, overwrite=true will overwrite a primitive field value even if exists
    ///Custom objects and functions are copied as/is by reference.
    ///</summary>
    ///<param name="src" />
    ///<param name="target" />
    ///<param name="options" type="Object">{ overwrite:false }</param>
    ///<returns type="Object">The copied object</returns>
    static copy<T>(source: T, target2?: T, options?, depth?): T {
        let src:any = source;
        let target:any = target2;
        if (depth == null)
            depth = 0;
        if (depth == 100) {
            console.warn("Q.copy is in depth of 100 - possible circular reference")
        }
        if (src === null && target === undefined)
            return null;
        if (src == target || src == null)
            return target;
        options = options || { overwrite: false };

        if (typeof (src) != "object") {
            if (options.overwrite || target == null)
                return src;
            return target;
        }
        if (typeof (src.clone) == "function") {
            if (options.overwrite || target == null)
                return src.clone();
            return target;
        }

        if (src instanceof Array) {
            if (target == null)
                target = [];

            for (var i = 0; i < src.length; i++) {
                var item = src[i];
                var item2 = target[i];
                item2 = Q.copy(item, item2, options, depth + 1);
                target[i] = item2;
            }
            target.splice(src.length, target.length - src.length);
            return target;
        }
        if (src.constructor != Object) {
            if (options.overwrite || target == null)
                return src;
            return target;
        }

        if (target == null)
            target = <T>{};
        for (var p in src) {
            var value = src[p];
            var value2 = target[p];
            value2 = Q.copy(value, value2, options, depth + 1);
            target[p] = value2;
        }
        return target;
    }
    //static objectToNameValueArray() {
    //    var list = [];
    //    for (var p in this.obj) {
    //        list.push({ name: p, value: this.obj[p] });
    //    }
    //    return list;
    //}
    static objectValuesToArray(obj) {
        var list = [];
        for (var p in obj) {
            list.push(obj[p]);
        }
        return list;
    }
    static cloneJson(obj) {
        if (obj == null)
            return null;
        return JSON.parse(JSON.stringify(obj));
    };
    static forEachValueInObject(obj, func, thisArg) {
        for (var p in obj) {
            func.call(thisArg, obj[p]);
        }
    };
    static mapKeyValueInArrayOrObject(objOrList, func, thisArg) {
        var list = [];
        if (objOrList instanceof Array) {
            for (var i = 0; i < objOrList.length; i++) {
                list.push(func.call(thisArg, i, objOrList[i]));
            }
        }
        else {
            for (var p in objOrList) {
                list.push(func.call(thisArg, p, objOrList[p]));
            }
        }
        return list;
    };
    //Alternative to $.map of jquery - which has array reducers overhead, and sometimes causes stackOverflow
    static jMap(objOrList, func, thisArg) {
        var list = [];
        if (objOrList instanceof Array) {
            for (var i = 0; i < objOrList.length; i++) {
                list.push(func.call(thisArg, objOrList[i], i));
            }
        }
        else {
            for (var p in objOrList) {
                list.push(func.call(thisArg, objOrList[p], p));
            }
        }
        return list;
    };
    ///Returns if the parameter is null, or an empty json object
    static isEmptyObject(obj) {
        if (obj == null)
            return true;
        if (typeof (obj) != "object")
            return false;
        for (var p in obj)
            return false;
        return true;
    };
    static min(list) {
        return Math.min.apply(null, list);
    };
    static max(list) {
        return Math.max.apply(null, list);
    };
    static stringifyFormatted(obj) {
        var sb:any = [];
        sb.indent = "";
        sb.indentSize = "    ";
        sb.startBlock = function (s, skipNewLine) {
            this.indent += sb.indentSize;
            this.push(s);
            if (!skipNewLine)
                this.newLine();
        };
        sb.endBlock = function (s, skipNewLine) {
            this.indent = this.indent.substr(0, this.indent.length - this.indentSize.length);
            if (!skipNewLine)
                this.newLine();
            this.push(s);
        };
        sb.newLine = function (s) {
            this.push("\n");
            this.push(this.indent);
        };
        Q.stringifyFormatted2(obj, sb);
        return sb.join("");
    }
    static _canInlineObject(obj) {
        return Object.values(obj).all(function (t) { return t == null || typeof (t) != "object" });
    }
    static _canInlineArray(list) {
        if (list.length == 0)
            return true;
        if (["string", "number"].contains(typeof (list[0])))
            return true;
        if (list.length == 1 && Q._canInlineObject(list[0]))
            return true;
        return false;

    }
    static stringifyFormatted2(obj, sb) {
        if (obj === undefined) {
            sb.push("undefined");
            return;
        }
        if (obj === null) {
            sb.push("null");
            return;
        }
        var type = typeof (obj);
        if (type == "object") {
            if (obj instanceof Array) {
                var list = obj;
                if (Q._canInlineArray(list)) {
                    sb.push("[");
                    list.forEach(function (t, i) {
                        Q.stringifyFormatted2(t, sb);
                        if (i < list.length - 1)
                            sb.push(", ");
                    });
                    sb.push("]");
                }
                else {
                    sb.startBlock("[");
                    for (var i = 0; i < list.length; i++) {
                        Q.stringifyFormatted2(list[i], sb);
                        if (i < list.length - 1) {
                            sb.push(",");
                            sb.newLine();
                        }
                    }
                    sb.endBlock("]");
                }
            }
            else if (obj instanceof Date) {
                sb.push("new Date(" + obj.valueOf() + ")");
            }
            else {
                var canInline = Q._canInlineObject(obj);
                sb.startBlock("{", canInline);
                var first = true;
                for (var p in obj) {
                    if (first)
                        first = false;
                    else {
                        sb.push(",");
                        if (!canInline)
                            sb.newLine();
                    }
                    if (/^[$A-Z_][0-9A-Z_$]*$/i.test(p))
                        sb.push(p + ": ");
                    else
                        sb.push(JSON.stringify(p) + ": ");
                    Q.stringifyFormatted2(obj[p], sb);
                }
                sb.endBlock("}", canInline);
            }
        }
        else if (type == "function") {
            var s = obj.toString();
            // if (s.startsWith("function anonymous("))
            //    s = "function "+s.substr("function anonymous".length);
            sb.push(s);
        }
        else {
            sb.push(JSON.stringify(obj));
        }
    }
    /* Binds all function on an object to the object, so the 'this' context will be reserved even if referencing the function alone */
    static bindFunctions(obj: Object) {
        for (var p in obj) {
            var func = obj[p];
            if (typeof (func) != "function")
                continue;
            if (func.boundTo == obj)
                continue;
            func = func.bind(obj);
            func.boundTo = obj;
            if (func.name == null)
                func.name = p;
            obj[p] = func;
        }
    }

    static parseInt(s) {
        if (s == null)
            return null;
        if (typeof (s) == "number")
            return s;
        if (!String.isInt(s))
            return null;
        var x = parseInt(s);
        if (isNaN(x))
            return null;
        return x;
    }
    static parseFloat(s) {
        if (s == null)
            return null;
        if (typeof (s) == "number")
            return s;
        if (!String.isFloat(s))
            return null;
        var x = parseFloat(s);
        if (isNaN(x))
            return null;
        return x;
    }
    static createSelectorFunction(selector) {
        if (selector == null)
            return function (t) { return t; };
        if (typeof (selector) == "function")
            return selector;
        if (selector instanceof Array) {
            var list = selector;
            if (typeof (list[0]) == "string") {
                return function (t) {
                    var obj = {};
                    for (var i = 0; i < list.length; i++) {
                        var prop = list[i];
                        obj[prop] = t[prop];
                    }
                    return obj;
                };
            }

            var list2 = selector.map(Q.createSelectorFunction);
            return function (t) {
                var value = t;
                for (var i = 0; i < list2.length; i++) {
                    if (value == null)
                        return undefined;
                    var func = list2[i];
                    value = func(value);
                };
                return value;
            };
        }
        return function (t) { return t[selector]; };
    }
    static isNullOrEmpty(stringOrArray) {
        return stringOrArray == null || stringOrArray.length == 0;
    }
    static isNotNullOrEmpty(stringOrArray) {
        return stringOrArray != null && stringOrArray.length > 0;
    }
    static isNullEmptyOrZero(v) {
        return v == null || v == 0 || v.length == 0;
    }
    static isAny(v, vals) {
        return vals.any(function (t) { return v == t; })
    }

}

