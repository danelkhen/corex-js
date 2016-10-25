export class Utils {
    static ToComparer<T, V>(getter: JsFunc<T, V>, desc?: bool): JsFunc<T, T, number> {
        if (desc)
            return getter.ToDescendingComparer();
        var valueComparer = GetDefaultComparer<V>();
        var comparer = <JsFunc<T, T, number>>((x, y) => valueComparer(getter(x), getter(y)));
        return comparer;
    }
    static ToDescendingComparer<T, V>(getter: JsFunc<T, V>): JsFunc<T, T, number> {
        var valueComparer = GetDefaultComparer<V>();
        var comparer = new JsFunc<T, T, number>((x, y) => valueComparer(getter(x), getter(y)) * -1);
        return comparer;
    }
    static ToDescending<T>(comparer: JsFunc<T, T, number>): JsFunc<T, T, number> {
        return new JsFunc<T, T, number>((x, y) => comparer(x, y) * -1);
    }
    static ThenBy<T>(comparer: JsFunc<T, T, number>, comparer2: JsFunc<T, T, number>): JsFunc<T, T, number> {
        return new JsFunc<T, T, number>((x, y) => {
            var diff = comparer(x, y);
            if (diff == 0)
                diff = comparer2(x, y);
            return diff;
        });
    }
    static ThenBy<T, V>(comparer: JsFunc<T, T, number>, getter: JsFunc<T, V>, desc?: bool): JsFunc<T, T, number> {
        return comparer.ThenBy(getter.ToComparer(desc));
    }
    static Order<T>(comparer: JsFunc<T, T, number>, list: Array<T>): T[] {
        var list2 = list.toArray();
        list2.sort(comparer);
        return list2;

    }
    static GetDefaultComparer<T>(): JsFunc2<T, T, number> {
        var comparer = <JsFunc2<T, T, number>>(Comparer._default.compare);
        return comparer;
    }
    static DataGetSet<T>(j: JQuery, name: string, value: T): T {
        var val = value.As<object>();
        var value2 = j.data(name);
        if (value2 == val)
            return value2.As<T>();
        j.data(name, val);
        return value2.As<T>();
    }
    static Prop<T>(prop: JsFunc<T, object>): string {
        let code: string;
        if (prop.As<JsObject>()["isDelegate"].As<bool>())
            code = prop.As<JsObject>()["func"].As<JsObject>().toString();
        else
            code = prop.As<JsObject>().toString();
        return code.substringBetween(".", ";");
    }
    public static ItemProp<T>(list: Array<T>, prop: JsFunc<T, object>): string {
        return Utils.Prop<T>(prop);
    }
    public static ItemGetter<T, V>(list: Array<T>, prop: JsFunc<T, V>): JsFunc<T, V> {
        return prop;
    }
}


export class Comparer<T>
{
    compare(x: T, y: T): number { return null; }
    static _default: Comparer<T>;
}


