"use strict";
interface ObjectConstructor {
    toArray(obj);
    allKeys(obj);
    keysValues(obj);
    pairs(obj);
    fromPairs(keysValues);
    fromKeysValues(keysValues);
    reversePairs(obj);
    forEach(obj, keyValueAction);
    toSortedByKey(obj);
    getCreateArray(obj, p);
    jsonStringifyEquals(x, y);
    tryGet(obj, indexers);
    trySet(obj, indexers, value);
    select(obj, selector);
    deleteKeysWithValues(obj, keysValues);
    getHashKey(obj);
    values(obj);
    removeAll(obj, predicate);
    clear(obj);
}
interface ArrayConstructor {
    joinAll(lists, keySelector, resultSelector);
    outerJoin(list1, list2, keySelector1, keySelector2, resultSelector);
    outerJoinAll(lists, keySelector, resultSelector);
    forEachAll(lists, action);
    selectAll(lists, func);
    forEachTwice(list1, list2, action);
    selectTwice(list1, list2, func);
    generate(length, generator);
    wrapIfNeeded(obj);
    toArray(arrayLike);
    generateNumbers(from, until);
    slice();
    concat();
    fromIterator(iterator);
    from<T>(arrayLike): Array<T>;
    //from(arrayLike):Array<any>;
}
interface Array<T> {
    isArrayOfPairs?: boolean;
    contains(obj: T): boolean;
    remove(obj: T): boolean;
    removeAt(index: number);
    take(count: number): T[];
    skip(count: number): T[];
    first(predicate?: (item: T, index?: number) => boolean): T;
    exceptNulls(): Array<T>;
    insert(index: number, item: T);
    toArray(): Array<T>;
    where(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[];
    removeAll<R>(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): void;
    select<R>(selector: (value: T, index: number, array: T[]) => R, thisArg?: any): R[];
    select<R>(selector: string, thisArg?: any): R[];
    selectMany<R>(callbackfn: (value: T, index: number, array: T[]) => R[], thisArg?: any): R[];
    groupBy<K>(callbackfn: (value: T, index: number, array: T[]) => K, thisArg?: any): Grouping<K, T>[];
    addRange(items: T[]);
    distinct(): T[];


    forEachJoin(action, actionBetweenItems);
    first(predicate);
    toArray();
    insert(index, item);
    insertRange(index, items);
    last(predicate);
    toObject(selector);
    toObjectKeys(defaultValue);
    keysToObject(defaultValue);
    pairsToObject(selector);
    copyPairsToObject(obj);
    removeFirst();
    removeRange(items);
    containsAny(items);
    any(predicate);
    forEachAsyncProgressive(actionWithCallback, finalCallback);
    whereEq(selector, value);
    whereNotEq(selector, value);
    firstEq(selector, value);
    firstNotEq(selector, value);
    addRange(items);
    diff(target);
    hasDiff(target);
    _forEachAsyncProgressive(actionWithCallback, finalCallback, index);
    mapAsyncProgressive(actionWithCallback, finalCallback);
    _mapAsyncProgressive(actionWithCallbackWithResult, finalCallback, index, results);
    mapWith(anotherList, funcForTwoItems);
    min();
    max();
    getEnumerator();
    orderBy(selector, desc, comparer);
    orderByDescending(selector, desc);
    sortBy(selector, desc, comparer);
    sortByDescending(selector);
    mapAsyncParallel(asyncFunc, finalCallback);
    forEachAsyncParallel(asyncFunc, finalCallback);
    clear();
    itemsEqual(list);
    select(selector);
    selectInvoke(name);
    joinWith(list2, keySelector1, keySelector2, resultSelector);
    all(predicate);
    flatten();
    selectToObject(keySelector, valueSelector);
    groupByToObject(keySelector, itemSelector);
    groupBy(keySelector, itemSelector);
    splitIntoChunksOf(countInEachChunk);
    avg();
    selectMany(selector);
    sum();
    skip(count);
    take(count);
    toSelector();
    removeNulls();
    exceptNulls();
    truncate(totalItems);
    random();
    selectRecursive(selector, recursiveFunc);
    selectManyRecursive(selector, recursiveFunc);
    peek(predicate);
    removeLast();
    add();
    forEachWith(list, action);
    selectWith(list, func);
    crossJoin(list2, selector);
}


interface DateConstructor {
    fromUnix(value);
    today();
    current();
    create(y, m, d, h, mm, s, ms);
    _parsePart(ctx, part, setter?);
    tryParseExact(s, formats);
    _tryParseExact(s, format);
    tryParseJsonDate(s);
    roundUsing(mathOp, date, part, precision);
    _dowNames;
    _dowNamesAbbr;
    _monthNames;
    _monthNamesAbbr;
    days: string[];
    _parts;
    _formatPartArgIndexes;
}
interface Date {
    _Kind;
    _parts;
    compareTo(value);
    year(value?);
    totalDays();
    totalHours();
    totalMinutes();
    totalSeconds();
    month(value?);
    day(value?);
    hour(value?);
    minute(value?);
    second(value?);
    ms(value?);
    toUnix();
    dayOfWeek();
    toLocalTime();
    toUniversalTime();
    subtract(date);
    Subtract$$DateTime(value);
    Subtract$$TimeSpan(value);
    format(format);
    clone();
    addMs(miliseconds);
    addSeconds(seconds);
    addMinutes(minutes);
    addHours(hours);
    addDays(days);
    addWeeks(weeks);
    addMonths(months);
    addYears(years);
    removeTime();
    hasTime();
    hasDate();
    removeDate();
    extractTime();
    extractDate();
    equals(obj);
    GetHashCode();
    getKind();
    round(part, precision);
    floor(part, precision);
    ceil(part, precision);
    add(value, part);
}
interface FunctionConstructor {
    combine(f1, f2);
    _combined(funcs);
    lambda(exp);
    _lambda(exp);
    addTo(target, funcs);
    _lambda_cache;
}
interface Function {
    bindArgs();
    toPrototypeFunction();
    toStaticFunction();
    toNew();
    applyNew(args);
    callNew(varargs);
    getName();
    addTo(target);
    comparers: Comparer[];
}
interface QConstructor {
    copy(src, target, options, depth);
    objectToNameValueArray();
    objectValuesToArray(obj);
    cloneJson(obj);
    forEachValueInObject(obj, func, thisArg);
    mapKeyValueInArrayOrObject(objOrList, func, thisArg);
    jMap(objOrList, func, thisArg);
    isEmptyObject(obj);
    min(list);
    max(list);
    stringifyFormatted(obj);
    _canInlineObject(obj);
    _canInlineArray(list);
    stringifyFormatted2(obj, sb);
    bindFunctions(obj);
    parseInt(s);
    parseFloat(s);
    createSelectorFunction(selector);
    isNullOrEmpty(stringOrArray);
    isNotNullOrEmpty(stringOrArray);
    isNullEmptyOrZero(v);
    isAny(v, vals);
}
interface StringConstructor {
    isInt(s);
    isFloat(s);
}
interface String {
    every(callbackfn: (value: string, index: number, array: string) => boolean, thisArg?: any): boolean;
    endsWith(s);
    startsWith(s);
    forEach(action);
    contains(s);
    replaceAll(token, newToken, ignoreCase): string;
    replaceMany(finds, replacer);
    truncateEnd(finalLength);
    truncateStart(finalLength);
    remove(index, length);
    insert(index, text);
    replaceAt(index, length, text);
    padRight(totalWidth, paddingChar?);
    padLeft(totalWidth, paddingChar?);
    toLambda();
    toSelector();
    substringBetween(start, end);
    all(predicate);
    every();
    isInt();
    isFloat();
    last(predicate);
    splitAt(index);
    lines();
}
interface NumberConstructor {
    generate(min, max, step);
    roundUsing(mathOp, x, precision);
}
interface Number {
    format(format);
    round(precision);
    ceil(precision);
    floor(precision);
    isInt();
    isFloat();
    inRangeInclusive(min, max);
}
interface JSON {
    iterateRecursively(obj, action);
}
interface Math {
    randomInt(min, max);
}
//declare class ComparerHelper {
//    static combine(comparers);
//    static create(selector, desc, comparer);
//    static createCombined(list);
//}
//declare class ArrayEnumerator<T> {
//    constructor(source: Array<T>);
//    moveNext();
//    getCurrent();
//}
interface ComparerConstructor {
}
interface Comparer {
    compare(x, y);
}
interface TimerConstructor {
}
interface Timer {
    set(ms);
    onTick();
    clear(ms);
}
interface QueryStringConstructor {
    parse(query, obj, defaults);
    stringify(obj);
    write(obj, sb);
}
interface ValueOfEqualityComparerConstructor {
}
interface ValueOfEqualityComparer {
    equals(x, y);
    getHashKey(x);
}

declare interface Grouping<K, T> extends Array<T> {
    key: K;
}


declare class TimeSpan {
    constructor(ms: number);
}

interface Error {
    wrap?(e: Error): Error;
    innerError?: Error;
    causedBy?(e: Error);
}


