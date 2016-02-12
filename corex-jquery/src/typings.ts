/// <reference path="../../corex-js/corex.d.ts" />
"use strict";

interface JQueryStatic {
    create(selector: string);
    fromArray$(list:JQuery[]);
    whenAll(list);
}

interface JQuery {
    bindChildrenToList<T>(selector: string, list: Array<T>, action: (el: JQuery, obj: T) => void);
    getAppend(selector: string);
    isotope(opts);
    toArray$(): Array<JQuery>;
    getAppendRemoveForEach<T>(selector: string, list: Array<T>, action: (el: JQuery, obj: T) => void);
    val2(value?: any): any;
    generator<T>(func: (obj: T) => JQuery): JQuery;
    generator<T>(): (obj: T) => JQuery;
    zip<T>(list: T[], opts?: Object): BoundJQuery<T>;
    dataItem(obj?): any;
}

interface BoundJQuery<T> extends JQuery {
    toArray$(): Array<BoundJQuery<T>>;
    dataItem(): T;
    existing(): BoundJQuery<T>;
    added(): BoundJQuery<T>;
    removed(): BoundJQuery<T>;
}


