/// <reference path="../../corex-js/corex.d.ts" />
"use strict";

interface JQueryStatic {
    create(selector: string);
    fromArray$(list: JQuery[]);
    whenAll(list);
}

interface JQuery {
    bindChildrenToList<T>(selector: string, list: Array<T>, action: (el: JQuery, obj: T, index:number) => void): JQuery;
    getAppendRemoveForEach<T>(selector: string, list: Array<T>, action: (el: JQuery, obj: T) => void): JQuery;
    getAppendRemove<T>(selector: string, total:number): JQuery;
    getAppend(selector: string): JQuery;
    toArray$(): Array<JQuery>;
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


