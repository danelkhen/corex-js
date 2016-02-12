"use strict";
Number.prototype.format = function (format) {
    var s = this.toString();
    for (var i = 0; i < format.length; i++) {
        var ch = format.charAt(i);
        if (ch == "0") {
            if (s.length < i + 1)
                s = "0" + s;
        }
        else
            throw new Error("not implemented");
    }
    return s;
}
Number.prototype.round = function (precision) {
    return Number.roundUsing(Math.round, this, precision);
}
Number.prototype.ceil = function (precision) {
    return Number.roundUsing(Math.ceil, this, precision);
}
Number.prototype.floor = function (precision) {
    return Number.roundUsing(Math.floor, this, precision);
}

Number.prototype.isInt = function () {
    return (this | 0) === this;
}
Number.prototype.isFloat = function () {
    return (this | 0) !== this;
}
Number.prototype.inRangeInclusive = function (min, max) {
    return this >= min && this <= max;
}


Number.generate = function (min, max, step) {
    var list = [];
    if (step == null)
        step = 1;
    for (var i = min; i <= max; i += step) {
        list.push(i);
    }
    return list;
}
Number.roundUsing = function (mathOp, x, precision) {
    if (precision == null)
        precision = 1;
    else if (precision < 0)
        precision *= -1;
    var mul = 1;
    while (((precision | 0) !== precision) && (mul < 10000000000)) {
        precision *= 10;
        x *= 10;
        mul *= 10;
    }
    return (mathOp(x / precision) * precision) / mul;
}
