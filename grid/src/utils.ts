type Compare<T> = JsFunc2<T, T, number>;

class Utils {
    static ToComparer<T, V>(getter: JsFunc1<T, V>, desc?: boolean): JsFunc2<T, T, number> {
        if (desc)
            return Utils.ToDescendingComparer(getter);
        var valueComparer = this.GetDefaultComparer<V>();
        var comparer = <JsFunc2<T, T, number>>((x, y) => valueComparer(getter(x), getter(y)));
        return comparer;
    }
    static ToDescendingComparer<T, V>(getter: JsFunc1<T, V>): JsFunc2<T, T, number> {
        var valueComparer = this.GetDefaultComparer<V>();
        var comparer = <JsFunc2<T, T, number>>((x, y) => valueComparer(getter(x), getter(y)) * -1);
        return comparer;
    }
    static ToDescending<T>(comparer: JsFunc2<T, T, number>): JsFunc2<T, T, number> {
        return (x, y) => comparer(x, y) * -1;
    }
    static ThenBy2<T>(comparer: JsFunc2<T, T, number>, comparer2: JsFunc2<T, T, number>): JsFunc2<T, T, number> {
        return <JsFunc2<T, T, number>>((x, y) => {
            var diff = comparer(x, y);
            if (diff == 0)
                diff = comparer2(x, y);
            return diff;
        });
    }
    static ThenBy<T, V>(comparer: JsFunc2<T, T, number>, getter: JsFunc1<T, V>, desc?: boolean): JsFunc2<T, T, number> {
        return Utils.ThenBy2(comparer, Utils.ToComparer(getter, desc));
        //return comparer.ThenBy(getter.ToComparer(desc));
    }
    static Order<T>(comparer: JsFunc2<T, T, number>, list: Array<T>): T[] {
        var list2 = list.toArray();
        list2.sort(comparer);
        return list2;

    }
    static GetDefaultComparer<T>(): JsFunc2<T, T, number> {
        var comparer = <JsFunc2<T, T, number>>(Comparer._default.compare);
        return comparer;
    }
    static DataGetSet<T>(j: JQuery, name: string, value: T): T {
        var val: any = value;
        var value2 = j.data(name);
        if (value2 == val)
            return value2;
        j.data(name, val);
        return value2;
    }
    static Prop<T>(prop: JsFunc1<T, any>): string {
        let prop2: any = prop;
        let code: string;
        if (prop2.isDelegate)
            code = prop2.func.toString();
        else
            code = prop.toString();
        return code.substringBetween(".", ";");
    }
    public static ItemProp<T>(list: Array<T>, prop: JsFunc1<T, any>): string {
        return Utils.Prop<T>(prop);
    }
    public static ItemGetter<T, V>(list: Array<T>, prop: JsFunc1<T, V>): JsFunc1<T, V> {
        return prop;
    }
}


//class Comparer<T>
//{
//    compare(x: T, y: T): number { return null; }
//    static _default: Comparer<T>;
//}


