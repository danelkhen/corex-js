corex-js
========

Core extensions and utility functions for js (corex.js) and jquery (corex-ui.js)

Corex
```
Object
    // ******* Class Methods *******
    toArray ( obj )
    allKeys ( obj )
    keysValues ( obj )
    pairs ( obj )
    fromPairs ( keysValues )
    fromKeysValues ( keysValues )
    reversePairs ( obj )
    forEach ( obj, keyValueAction )
    toSortedByKey ( obj )
    getCreateArray ( obj, p )
    jsonStringifyEquals ( x, y )
    tryGet ( obj, indexers )
    trySet ( obj, indexers, value )
    select ( obj, selector )
    deleteKeysWithValues ( obj, keysValues )
    getHashKey ( obj )
    values ( obj )
    removeAll ( obj, predicate )
    clear ( obj )

Function
    // ******* Instance Methods *******
    bindArgs (  )
    toPrototypeFunction (  )
    toStaticFunction (  )
    toNew (  )
    applyNew ( args )
    callNew ( varargs )
    getName (  )
    addTo ( target )

    // ******* Class Methods *******
    lambda ( exp )
    addTo ( target, funcs )

Array
    // ******* Instance Methods *******
    splitIntoChunksOf ( countInEachChunk )
    forEachJoin ( action, actionBetweenItems )
    first ( predicate )
    toArray (  )
    insert ( index, item )
    insertRange ( index, items )
    last ( predicate )
    toObject ( selector )
    toObjectKeys ( defaultValue )
    copyPairsToObject ( obj )
    removeFirst (  )
    remove ( item )
    removeRange ( items )
    contains ( s )
    containsAny ( items )
    any ( predicate )
    distinct ( keyGen )
    removeAll ( predicate )
    removeAt ( index )
    forEachAsyncProgressive ( actionWithCallback, finalCallback )
    where ( predicate )
    whereEq ( selector, value )
    addRange ( items )
    diff ( target )
    hasDiff ( target )
    mapAsyncProgressive ( actionWithCallback, finalCallback )
    mapWith ( anotherList, funcForTwoItems )
    min (  )
    max (  )
    getEnumerator (  )
    orderBy ( selector, desc )
    orderByDescending ( selector, desc )
    sortBy ( selector, desc )
    sortByDescending ( selector )
    mapAsyncParallel ( asyncFunc, finalCallback )
    clear (  )
    itemsEqual ( list )
    select ( selector )
    selectInvoke ( name )
    joinWith ( list2, keySelector1, keySelector2, resultSelector )
    all ( predicate )
    flatten (  )
    selectToObject ( keySelector, valueSelector )
    groupByToObject ( keySelector, itemSelector )
    groupBy ( keySelector, itemSelector )
    avg (  )
    selectMany ( selector )
    sum (  )
    skip ( count )
    take ( count )
    toSelector (  )
    removeNulls (  )
    exceptNulls (  )
    truncate ( totalItems )
    random (  )
    selectRecursive ( selector, recursiveFunc )
    selectManyRecursive ( selector, recursiveFunc )
    peek ( predicate )
    removeLast (  )
    add (  )

    // ******* Class Methods *******
    joinAll ( lists, keySelector, resultSelector )
    outerJoin ( list1, list2, keySelector1, keySelector2, resultSelector )
    outerJoinAll ( lists, keySelector, resultSelector )
    forEachAll ( lists, action )
    selectAll ( lists, func )
    forEachTwice ( list1, list2, action )
    selectTwice ( list1, list2, func )
    generate ( length, generator )
    wrapIfNeeded ( obj )
    toArray ( obj )
    generateNumbers ( from, until )
    slice (  )
    concat (  )

Date
    // ******* Instance Methods *******
    compareTo ( value )
    year ( value )
    totalDays (  )
    totalHours (  )
    totalMinutes (  )
    month ( value )
    day ( value )
    hour ( value )
    minute ( value )
    second ( value )
    ms ( value )
    toUnix (  )
    dayOfWeek (  )
    toLocalTime (  )
    toUniversalTime (  )
    subtract ( date )
    format ( format )
    clone (  )
    addMs ( miliseconds )
    addSeconds ( seconds )
    addMinutes ( minutes )
    addHours ( hours )
    addDays ( days )
    addMonths ( months )
    addYears ( years )
    removeTime (  )
    hasTime (  )
    hasDate (  )
    removeDate (  )
    extractTime (  )
    extractDate (  )
    equals ( obj )
    GetHashCode (  )
    getKind (  )
    round ( part, precision )
    floor ( part, precision )
    ceil ( part, precision )
    add ( value, part )

    // ******* Class Methods *******
    fromUnix ( value )
    today (  )
    current (  )
    new ( y, m, d, h, mm, s, ms )
    tryParseExact ( s, formats )
    tryParseJsonDate ( s )
    roundUsing ( mathOp, date, part, precision )

Number
    // ******* Instance Methods *******
    format ( format )
    round ( precision )
    ceil ( precision )
    floor ( precision )
    isInt (  )
    isFloat (  )
    inRangeInclusive ( min, max )

    // ******* Class Methods *******
    generate ( min, max, step )
    roundUsing ( mathOp, x, precision )

String
    // ******* Instance Methods *******
    contains ( s )
    endsWith ( suffix )
    startsWith ( s )
    replaceAll ( token, newToken, ignoreCase )
    replaceMany ( finds, replacer )
    truncateEnd ( finalLength )
    truncateStart ( finalLength )
    remove ( index, length )
    insert ( index, text )
    replaceAt ( index, length, text )
    padRight ( totalWidth, paddingChar )
    padLeft ( totalWidth, paddingChar )
    toLambda (  )
    toSelector (  )
    substringBetween ( start, end )
    all ( predicate )
    every (  )
    isInt (  )
    isFloat (  )
    last ( predicate )

    // ******* Class Methods *******
    isInt ( s )
    isFloat ( s )

Math
    // ******* Class Methods *******
    randomInt ( min, max )

Error
    // ******* Class Methods *******
    captureStackTrace (  )

Q
    // ******* Class Methods *******
    copy ( src, target, options, depth )
    isNullOrEmpty ( stringOrArray )
    isNotNullOrEmpty ( stringOrArray )

QueryString
    // ******* Class Methods *******
    parse ( url, obj, defaults )
    stringify ( obj )
    write ( obj, sb )

Timer
    // ******* Instance Methods *******
    set ( ms )
    onTick (  )
    clear ( ms )
```



Corex UI - jQuery object extensions
```
// creates an element from a selector -> $.create("div.nice-panel#mydiv") -> <div class="nice-panel" id="mydiv"></div>
$.create(selector)

// gets or appends a child element according to a selector
.getAppend(selector, [options])

// gets a total number of children elements according to a selector, creating and appending new ones if needed, as well as removing if there are more than the total.
.getAppendRemove(selector, total, [options])
    
// will get/append a child element for every item in the supplied list, and invoke action(el, obj) on each element/object pair
.getAppendRemoveForEach(selector, list, action, [options])
```

options
    total
    list
    action
    storeDataItem
    removeRemaining
    create
    destroy

