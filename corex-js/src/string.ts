"use strict";
String.prototype.forEach = Array.prototype.forEach;

String.prototype.contains = function (s) {
    return this.indexOf(s) >= 0;
}
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.startsWith = function (s) {
    return this.indexOf(s) == 0;
}
/**
 * ReplaceAll by Fagner Brack (MIT Licensed)
 * Replaces all occurrences of a substring in a string
 */
String.prototype.replaceAll = function (token, newToken, ignoreCase) {
    var _token;
    var str = this + "";
    var i = -1;

    if (typeof token === "string") {
        if (ignoreCase) {
            _token = token.toLowerCase();
            while ((
                i = str.toLowerCase().indexOf(
                    token, i >= 0 ? i + newToken.length : 0
                )) !== -1
            ) {
                str = str.substring(0, i) +
                    newToken +
                    str.substring(i + token.length);
            }

        }
        else {
            return this.split(token).join(newToken);
        }

    }
    return str;
};
String.prototype.replaceMany = function (finds, replacer) {
    var s = this;
    var s2 = "";
    var i = 0;
    while (i < s.length) {
        var append = s[i];
        var inc = 1;
        for (var j = 0; j < finds.length; j++) {
            var find = finds[j];
            var token = s.substr(i, find.length);
            if (find == token) {
                var replace = replacer(find, i);
                append = replace;
                inc = find.length;
                break;
            }
        }
        s2 += append;
        i += inc;
    }
    return s2;
}
String.prototype.truncateEnd = function (finalLength) {
    if (this.length > finalLength)
        return this.substr(0, finalLength);
    return this;
}
String.prototype.truncateStart = function (finalLength) {
    if (this.length > finalLength)
        return this.substr(this.length - finalLength);
    return this;
}
String.prototype.remove = function (index, length) {
    var s = this.substr(0, index);
    s += this.substr(index + length);
    return s;
}
String.prototype.insert = function (index, text) {
    var s = this.substr(0, index);
    s += text;
    s += this.substr(index);
    return s;
}
String.prototype.replaceAt = function (index, length, text) {
    return this.remove(index, length).insert(index, text);
}
String.prototype.padRight = function (totalWidth, paddingChar) {
    if (paddingChar == null || paddingChar == "")
        paddingChar = " ";
    var s = this;
    while (s.length < totalWidth)
        s += paddingChar;
    return s;
}
String.prototype.padLeft = function (totalWidth, paddingChar) {
    if (paddingChar == null || paddingChar == "")
        paddingChar = " ";
    var s = this;
    while (s.length < totalWidth)
        s = paddingChar + s;
    return s;
}
String.prototype.toLambda = function () {
    return Function.lambda(this);
}
String.prototype.toSelector = function () {
    return Q.createSelectorFunction(this);
}
String.prototype.substringBetween = function (start, end) {
    var s = this;
    var i1 = s.indexOf(start);
    if (i1 < 0)
        return null;
    var i2 = s.indexOf(end, i1 + 1);
    if (i2 < 0)
        return null;
    return s.substring(i1 + start.length, i2);
}
String.prototype.all = Array.prototype.all;
String.prototype.every = <any>Array.prototype.every;
String.prototype.isInt = function () {
    return String.isInt(this);
}
String.prototype.isFloat = function () {
    var floatRegex = /^[+-]?[0-9]*[\.]?[0-9]*$/;
    return String.isFloat(this);
}
String.isInt = function (s) {
    var intRegex = /^[+-]?[0-9]+$/;
    return intRegex.test(s);
}
String.isFloat = function (s) {
    var floatRegex = /^[+-]?[0-9]*[\.]?[0-9]*$/;
    return floatRegex.test(s);
}
String.prototype.last = function (predicate) {
    if (this.length == 0)
        return null;
    if (predicate == null)
        return this[this.length - 1];
    for (var i = this.length; i >= 0; i--) {
        if (predicate(this[i]))
            return this[i];
    }
    return null;
}

String.prototype.splitAt = function (index) {
    return [this.substr(0, index), this.substr(index)];
}
String.prototype.lines = function () {
    return this.match(/[^\r\n]+/g);
}
