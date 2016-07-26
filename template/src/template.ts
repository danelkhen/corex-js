
export class Template {
    static tags: Map<string, string> = new Map<string, string>();
    static registerTag(tag: string, html: string) {
        this.tags.set(tag.toUpperCase(), html);
    }
    static compileTemplateString(s: string) {
        if (s.startsWith("{{") && s.endsWith("}}")) {
            let code = s.substring(2, s.length - 2);
            return this.compileTemplateExpression(code);
        }
        return null;
    }
    static compiledExpressionsCache = new Map<string, Function>();
    static compileTemplateExpression(code: string) {
        let func = this.compiledExpressionsCache.get(code);
        if (func === undefined) {
            func = this._compileTemplateExpression(code);
            this.compiledExpressionsCache.set(code, func);
        }
        return func;
    }
    static _compileTemplateExpression(code: string) {
        let parsed = FunctionHelper.parse(code);
        if (parsed != null) {
            if (parsed.type == "ArrowExpressionFunction") {
                let body = parsed.body;
                let prmsAndBody = parsed.prms.toArray();
                prmsAndBody.push("return " + body);
                let func = Function.apply(null, prmsAndBody);
                return func;
            }
            else if (parsed.type == "ArrowFunction") {
                let body = parsed.body;
                let prmsAndBody = parsed.prms.toArray();
                prmsAndBody.push(body);
                let func = Function.apply(null, prmsAndBody);
                return func;
            }
        }
        let func = new Function("___", "return ___." + code);
        return func;
    }

    static onPromise(promise: Promise<any>): Promise<any> { return promise; }
    static dataBind(node: Node, obj: any, thisContext: any) {
        if (node.nodeType == 3) {
            let node2: NodeEx = node;
            if (node2.originalNodeValue == null)
                node2.originalNodeValue = node.nodeValue;
            let s = node2.originalNodeValue;
            if ((node.nextSibling != null || node.previousSibling != null) && s.trim() == "") {
                node.parentElement.removeChild(node);
                return;
            }
            let func = this.compileTemplateString(s);
            if (func != null)
                node.nodeValue = func.call(thisContext, obj);
        }
        else if (node.nodeType == 1) {
            let el = <HTMLElement>node;
            let ignoreAtt = el.getAttribute("_ignore");
            if (ignoreAtt != null)
                return;
            let tmpl = this.tags.get(el.nodeName);
            if (tmpl != null && el.childNodes.length == 0) {
                el.innerHTML = tmpl;
            }
            let atts = Helper.getAttributes(node);
            let stop = atts.first(att => {
                if (att.name == "_if") {
                    let func = this.compileTemplateExpression(att.value);
                    let res = func.call(thisContext, obj);
                    $(el).toggleClass("if_true", res);
                    $(el).toggleClass("if_false", !res);
                    if (!res)
                        return true;
                }
                if (att.name == "_for") {
                    let sourceFunc = this.compileTemplateExpression(att.value);
                    let source = sourceFunc.call(thisContext, obj);
                    this.repeat(el, source, thisContext);
                    return true;
                }

                if (att.name.startsWith("_")) {
                    let func = this.compileTemplateExpression(att.value);
                    if (att.name.startsWith("_on")) {
                        let evName = att.name.substr(3);
                        let evFullName = evName + ".templator";
                        $(el).off(evFullName).on(evFullName, e => {
                            let res = func.call(thisContext, e, obj);
                            if (Helper.isPromise(res)) {
                                res = this.onPromise(res);
                            }
                            return res;
                        });
                    }
                    else {
                        let res = func.call(thisContext, obj);
                        let propName = att.name.substr(1);
                        if (propName == "class")
                            propName = "className";
                        node[propName] = res;
                    }
                    return false;
                }
                let func = this.compileTemplateString(att.value);
                if (func != null) {
                    let res = func.call(thisContext, obj);
                    let propName = att.name;
                    if (propName == "class")
                        propName = "className";
                    node[propName] = res;
                }
                return false;
            });
            if (stop)
                return;
            Array.from<Node>(node.childNodes).forEach((t, i) => {
                if ($(t).is(".template-instance"))
                    return; //these should be hanlded by forAtt
                this.dataBind(t, obj, thisContext);
            });
        }
    }
    static repeat(el: any, list: any[], thisContext: any) {
        let el2: JQuery;
        if (typeof (el) == "string")
            el2 = $(el + ".template");
        else
            el2 = $(el);

        if (el2.length == 0) {
            console.warn("can't find template", el);
            return;
        }
        let el3 = <HTMLElementEx>el2[0];

        let els2: HTMLElementEx[] = el2.siblings(".template-instance").toArray();
        if (list != null) {
            let els = list.select(obj => {
                let el4 = els2.first(t => t._data == obj);
                if (el4 == null) {
                    let el3 = el2.clone().removeAttr("_for");
                    el4 = el3[0];
                    el4._data = obj;
                    el3.removeClass("template").addClass("template-instance");
                }
                else {
                    els2.remove(el4);
                }
                this.dataBind(el4, obj, thisContext);
                return el4;
            });
            $(els2).remove();
            el2.after(els);
        }
        else {
            $(els2).remove();
        }
    }
    //static initTemplate(el: HTMLElement, ctl: Object) {
    //    this.dataBind(el, ctl, ctl);
    //}

    //static initTemplate2(el: HTMLElement, ctl: Object) {
    //    let tracker = new ChangeTracker(ctl);
    //    tracker.enter = e => {
    //        if (e.value == null)
    //            return true;
    //        let ctor = e.value.constructor;
    //        let allowed: any[] = [Object, Array, Number, Boolean, String, Function];
    //        let enter = allowed.contains(ctor);
    //        return enter;
    //    };
    //    tracker.init();
    //}
}


interface HTMLElementEx extends HTMLElement {
    _data?: any;
}


export class Helper {

    static _isBrowserReversesAttributes: boolean;
    static isBrowserReversesAttributes() {
        if (this._isBrowserReversesAttributes == null) {
            let div = document.createElement("div");
            div.innerHTML = "<a b='c' d='e'/>";
            this._isBrowserReversesAttributes = div.firstChild.attributes[0].name == "d";
        }
        return this._isBrowserReversesAttributes;
    }
    static getAttributes(node: Node): Attr[] {
        let list = Array.from<Attr>(node.attributes);
        if (this.isBrowserReversesAttributes())
            list.reverse();
        return list;
    }

    static isPromise(obj: any): boolean {
        return obj != null && obj.then && obj.catch;
    }
}

export class FunctionHelper {
    static parse(s: string): ParsedFunction {
        var prms = this.parseArrowFunctionArgNames(s);
        if (prms != null) {
            var arrowEnd = s.indexOf("=>") + 2;
            var body = s.substr(arrowEnd);
            var type = "ArrowExpressionFunction";
            let body2 = body.trim();
            if (body2.startsWith("{") && body2.endsWith("}")) {
                type = "ArrowFunction";
                body = body2.substring(1, body2.length - 1);
            }
            return { body: body, prms: prms, type: type, name: null };
        }
        prms = this.parsePrms(s);
        if (prms == null)
            return null;
        var body = s.substring(s.indexOf("{") + 1, s.lastIndexOf("}") - 1);
        var name = s.substringBetween("function ", "(").trim();
        var type = name == "" ? "AnonymousFunction" : "NamedFunction";
        return { body: body, prms: prms, type: type, name: name };
    }
    static FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    static FN_ARG_SPLIT = /,/;
    static FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    static STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    static parsePrms(s) {
        var list = [];
        var fnText = s.toString().replace(this.STRIP_COMMENTS, '');
        var argDecl = fnText.match(this.FN_ARGS);
        if (argDecl == null)
            return null;
        argDecl[1].split(this.FN_ARG_SPLIT).forEach(function (arg) {
            arg.replace(this.FN_ARG, function (all, underscore, name) {
                list.push(name);
            });
        });
        return list;
    }
    static isValidIdentifier(s) {
        return /^[a-zA-Z_]+[a-zA-Z0-9]*$/.test(s);
    }

    static parseArrowFunctionArgNames(s: string): string[] {
        var index = s.indexOf("=>");
        if (index <= 0)
            return null;
        var sub = s.substr(0, index).trim();
        if (sub.startsWith("(") && sub.endsWith(")")) {
            var sub2 = sub.substr(1, sub.length - 2).trim();
            if (sub2 == "")
                return [];
            var tokens = sub2.split(',').selectInvoke("trim");
            if (tokens.all(this.isValidIdentifier))
                return tokens;
            return null;
        }
        if (this.isValidIdentifier(sub))
            return [sub];
        return null;
    }
}

export interface ParsedFunction {
    body: string;
    prms: string[];
    type: string;
    name: string;
}


interface NodeEx extends Node {
    originalNodeValue?: string;
}