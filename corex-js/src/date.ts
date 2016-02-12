"use strict";

/* Date extensions, taken from jsclr framework */
Date.prototype.compareTo = function (value) {
    return this.valueOf() - value.valueOf();
};
Date.prototype.year = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCFullYear();
        return this.getFullYear();
    }
    var d = this.clone();
    if (d._Kind == 1)
        d.setUTCFullYear(value);
    else
        d.setFullYear(value);
    return d;
};
Date.prototype.totalDays = function () {
    return this.valueOf() / (24 * 60 * 60 * 1000);
};
Date.prototype.totalHours = function () {
    return this.valueOf() / (60 * 60 * 1000);
};
Date.prototype.totalMinutes = function () {
    return this.valueOf() / (60 * 1000);
};
Date.prototype.totalSeconds = function () {
    return this.valueOf() / 1000;
};
Date.prototype.month = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCMonth() + 1;
        return this.getMonth() + 1;
    }
    var d = this.clone();
    if (d._Kind == 1)
        d.setUTCMonth(value - 1);
    else
        d.setMonth(value - 1);
    return d;
};
Date.prototype.day = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCDate();
        return this.getDate();
    }
    var d = this.clone();
    if (d._Kind == 1)
        d.setUTCDate(value);
    else
        d.setDate(value);
    return d;
};
Date.prototype.hour = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCHours();
        return this.getHours();
    }
    var d = this.clone();
    if (d._Kind == 1)
        d.setUTCHours(value);
    else
        d.setHours(value);
    return d;
};
Date.prototype.minute = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCMinutes();
        return this.getMinutes();
    }
    var d = this.clone();
    if (d._Kind == 1)
        d.setUTCMinutes(value);
    else
        d.setMinutes(value);
    return d;
};
Date.prototype.second = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCSeconds();
        return this.getSeconds();
    }
    var d = this.clone();
    if (d._Kind == 1)
        d.setUTCSeconds(value);
    else
        d.setSeconds(value);
    return d;
};
Date.prototype.ms = function (value) {
    if (value == null) {
        if (this._Kind == 1)
            return this.getUTCMilliseconds();
        return this.getMilliseconds();
    }
    var d = this.clone();
    if (d._Kind == 1)
        d.setUTCMilliseconds(value);
    else
        d.setMilliseconds(value);
    return d;
};
Date.prototype.toUnix = function () {
    if (this._Kind == 1)
        throw new Error();
    return Math.round(this.getTime() / 1000);
};
Date.prototype.dayOfWeek = function () {
    return this.getDay() + 1;
};
Date.prototype.toLocalTime = function () {
    if (this._Kind != 1)
        return this;
    var x = this.clone();
    x._Kind = 2;
    return x;
};
Date.prototype.toUniversalTime = function () {
    if (this._Kind == 1)
        return this;
    var x = this.clone();
    x._Kind = 1;
    return x;
};
Date.prototype.subtract = function (date) {
    var diff = this.valueOf() - date.valueOf();
    return new Date(diff);
};
Date.prototype.Subtract$$DateTime = function (value) {
    var diff = this.valueOf() - value.valueOf();
    return new TimeSpan(diff * 10000);
};
Date.prototype.Subtract$$TimeSpan = function (value) {
    var newDate = this.clone();
    newDate.setMilliseconds(this.getMilliseconds() + value.getTotalMilliseconds());
    return newDate;
};
Date.prototype.format = function (format) {
    if (typeof (format) == "object") {
        var options = format;
        if (options.noTime != null && !this.hasTime())
            return this.format(options.noTime);
        else if (options.noDate != null && !this.hasDate())
            return this.format(options.noDate);
        else if (options.fallback != null)
            return this.format(options.fallback);
        return this.toString();
    }
    var s = format;

    var s2 = s.replaceMany("yyyy yy MMMM MMM MM M dddd ddd dd d HH H mm m ss s ff f".split(" "), function (t) {
        switch (t) {
            case "yyyy": return this.year().format("0000");
            case "yy": return this.year().format("00").truncateStart(2);
            case "y": return this.year().toString();
            case "MMMM": return Date._monthNames[this.getMonth()];
            case "MMM": return Date._monthNamesAbbr[this.getMonth()];
            case "MM": return this.month().format("00");
            case "M": return this.month().toString();
            case "dd": return this.day().format("00");
            case "d": return this.day().toString();
            case "dddd": return Date._dowNames[this.getDay()];
            case "ddd": return Date._dowNamesAbbr[this.getDay()];
            case "HH": return this.hour().format("00");
            case "H": return this.hour().toString();
            case "mm": return this.minute().format("00");
            case "m": return this.minute().toString();
            case "ss": return this.second().format("00");
            case "s": return this.second().toString();
            case "ff": return this.ms().format("00");
            case "f": return this.ms().toString();
        }

    }.bind(this));
    return s2.toString();
};
Date.prototype.clone = function () {
    var x = new Date(this.valueOf());
    x._Kind = this._Kind;
    return x;
};
Date.prototype.addMs = function (miliseconds) {
    var date2 = this.clone();
    date2.setMilliseconds(date2.getMilliseconds() + miliseconds);
    return date2;
};
Date.prototype.addSeconds = function (seconds) {
    var date2 = this.clone();
    date2.setSeconds(date2.getSeconds() + seconds);
    return date2;
};
Date.prototype.addMinutes = function (minutes) {
    var date2 = this.clone();
    date2.setMinutes(date2.getMinutes() + minutes);
    return date2;
};
Date.prototype.addHours = function (hours) {
    var date2 = this.clone();
    date2.setHours(date2.getHours() + hours);
    return date2;
};
Date.prototype.addDays = function (days) {
    var date2 = this.clone();
    date2.setDate(date2.getDate() + days);
    return date2;
};
Date.prototype.addWeeks = function (weeks) {
    return this.addDays(weeks * 7);
};
Date.prototype.addMonths = function (months) {
    var date2 = this.clone();
    date2.setMonth(date2.getMonth() + months);
    return date2;
};
Date.prototype.addYears = function (years) {
    var date2 = this.clone();
    date2.setFullYear(date2.getFullYear() + years);
    return date2;
};
Date.prototype.removeTime = function () {
    var date2 = this.clone();
    date2.setHours(0, 0, 0, 0);
    return date2;
};
Date.prototype.hasTime = function () {
    return this.hour() != 0 && this.second() != 0 && this.ms() != 0;
};
Date.prototype.hasDate = function () {
    var date2 = new Date(0);
    return this.year() != date2.year() && this.month() != date2.month() && this.day() != date2.day();
};
Date.prototype.removeDate = function () {
    var time = this.clone();
    time.setHours(this.hour(), this.minute(), this.second(), this.ms());
    return time;
};
Date.prototype.extractTime = function () {
    return this.removeDate();
};
Date.prototype.extractDate = function () {
    return this.removeTime();
};
Date.prototype.equals = function (obj) {
    if (obj == null)
        return false;
    return obj.valueOf() == this.valueOf();
};
Date.prototype.GetHashCode = function () {
    return this.valueOf();
};
Date.prototype.getKind = function () {
    if (this._Kind == null)
        return 2;
    return this._Kind;
};
Date.prototype.round = function (part, precision) {
    return Date.roundUsing(Math.round, this, part, precision);
}
Date.prototype.floor = function (part, precision) {
    return Date.roundUsing(Math.floor, this, part, precision);
}
Date.prototype.ceil = function (part, precision) {
    return Date.roundUsing(Math.ceil, this, part, precision);
}
Date.prototype.add = function (value, part) {
    var map = {
        "day": "addDays",
        "month": "addMonths",
        "week": "addWeeks",
        "hour": "addHours",
        "minute": "addMinutes",
        "second": "addSeconds",
        "ms": "addMs",
    };
    if (part == null)
        part = "ms";
    var func = map[part];
    var date2 = this[func](value);
    return date2;
};



Date._dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
Date._dowNamesAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
Date._monthNamesAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
Date._monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Date.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
Date._parts = ["year", "month", "day", "hour", "minute", "second", "ms"];


Date.fromUnix = function (value) {
    return new Date(value * 1000);
};
Date.today = function () {
    return new Date().removeTime();
};
Date.current = function () {
    return new Date();
};
Date.create = function (y, m, d, h, mm, s, ms) {
    if (ms != null)
        return new Date(y, m - 1, d, h, mm, s, ms);
    if (s != null)
        return new Date(y, m - 1, d, h, mm, s);
    if (mm != null)
        return new Date(y, m - 1, d, h, mm);
    if (h != null)
        return new Date(y, m - 1, d, h);
    if (d != null)
        return new Date(y, m - 1, d);
    if (m != null)
        return new Date(y, m - 1);
    if (y != null)
        return new Date(y);
    var x = new Date(1970, 0, 1);
    x.setHours(0, 0, 0, 0);
    return x;
}

Date._formatPartArgIndexes = { yyyy: 0, yy: 0, MMM: 1, MM: 1, M: 1, dd: 2, d: 2, H: 3, HH: 3, h: 3, hh: 3, m: 4, mm: 4, s: 5, ss: 5, f: 6, ff: 6 };
Date._parsePart = function (ctx, part, setter) {
    if (ctx.failed)
        return;
    var index = ctx.format.indexOf(part);
    if (index < 0)
        return;
    var token = ctx.s.substr(index, part.length);
    if (token.length == 0) {
        ctx.failed = true;
        return;
    }
    var value;
    if (part == "MMM") {
        value = Date._monthNamesAbbr.indexOf(token);
        if (value >= 0)
            value++;
    }
    else {
        value = Q.parseInt(token);
        if (value == null) {
            ctx.failed = true;
            return;
        }
    }
    var argIndex = Date._formatPartArgIndexes[part];
    ctx.args[argIndex] = value;
    //ctx.date = setter.call(ctx.date, value);
    ctx.format = ctx.format.replaceAt(index, part.length, "".padRight(part.length));
    ctx.s = ctx.s.replaceAt(index, part.length, "".padRight(part.length));
}
Date.tryParseExact = function (s, formats) {
    if (typeof (formats) == "string")
        formats = [formats];
    for (var i = 0; i < formats.length; i++) {
        var x = Date._tryParseExact(s, formats[i]);
        if (x != null)
            return x;
    }
    return null;
};
Date._tryParseExact = function (s, format) {
    if (s.length != format.length)
        return null;
    var ctx = { s: s, format: format, args: [1970, 0, 1, 0, 0, 0, 0], failed:false };
    Date._parsePart(ctx, "yyyy");
    Date._parsePart(ctx, "yy");
    Date._parsePart(ctx, "MMM");
    Date._parsePart(ctx, "MM");
    Date._parsePart(ctx, "dd");
    Date._parsePart(ctx, "HH");
    Date._parsePart(ctx, "mm");
    Date._parsePart(ctx, "ss");
    if (ctx.failed)
        return null;
    if (ctx.s != ctx.format)
        return null;
    var date = Date.create.apply(null, ctx.args);
    return date;
};
Date.tryParseJsonDate = function (s) {
    if (s.length == 26 && s[0] == "\"" && s[s.length - 1] == "\"") {
        s = s.substr(1, 24);
    }
    if (s.length == 24 && /[0-9]+-[0-9]+-[0-9]+T[0-9]+:[0-9]+:[0-9]+\.[0-9]+Z/.test(s)) {
        var d = new Date(s);
        if (!isNaN(d.valueOf()))
            return d;
    }
    return null;

}
Date.roundUsing = function (mathOp, date, part, precision) {
    var parts = Date._parts;
    if (part == null)
        part = "second";
    if (!precision)
        precision = 1;
    var partIndex = parts.indexOf(part);
    if (partIndex < 0) {
        part = "second";
        partIndex = 5;
    }
    var date2 = date.clone();
    var value = date2[part]();
    value = Number.roundUsing(mathOp, value, precision);
    date2 = date2[part](value);
    for (var i = partIndex + 1; i < parts.length; i++) {
        var part2 = parts[i];
        date2 = date2[part2](0);
    }
    return date2;
}
