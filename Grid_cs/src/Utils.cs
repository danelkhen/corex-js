using SharpKit.JavaScript;
using SharpKit.jQuery;
using System;

namespace corexjs
{
    [JsType(JsMode.Prototype, NativeOverloads = false)]
    public static class Utils
    {
        public static JsFunc<T, T, JsNumber> ToComparer<T, V>(this JsFunc<T, V> getter, bool desc=false)
        {
            if (desc)
                return getter.ToDescendingComparer();
            var valueComparer = GetDefaultComparer<V>();
            var comparer = new JsFunc<T, T, JsNumber>((x, y) => valueComparer(getter(x), getter(y)));
            return comparer;
        }
        public static JsFunc<T, T, JsNumber> ToDescendingComparer<T, V>(this JsFunc<T, V> getter)
        {
            var valueComparer = GetDefaultComparer<V>();
            var comparer = new JsFunc<T, T, JsNumber>((x, y) => valueComparer(getter(x), getter(y))*-1);
            return comparer;
        }
        public static JsFunc<T, T, JsNumber> ToDescending<T>(this JsFunc<T, T, JsNumber> comparer)
        {
            return new JsFunc<T, T, JsNumber>((x, y) => comparer(x,y)*-1);
        }
        public static JsFunc<T, T, JsNumber> ThenBy<T>(this JsFunc<T, T, JsNumber> comparer, JsFunc<T, T, JsNumber> comparer2)
        {
            return new JsFunc<T, T, JsNumber>((x, y) =>
            {
                var diff = comparer(x, y);
                if (diff == 0)
                    diff = comparer2(x, y);
                return diff;
            });
        }
        public static JsFunc<T, T, JsNumber> ThenBy<T,V>(this JsFunc<T, T, JsNumber> comparer, JsFunc<T, V> getter, bool desc = false)
        {
            return comparer.ThenBy(getter.ToComparer(desc));
        }
        public static JsArray<T> Order<T>(this JsFunc<T, T, JsNumber> comparer, JsArray<T> list)
        {
            var list2 = list.toArray();
            list2.sort(comparer);
            return list2;

        }
        public static JsFunc<T, T, JsNumber> GetDefaultComparer<T>()
        {
            var comparer = new JsFunc<T, T, JsNumber>(Comparer<T>._default.compare);
            return comparer;
        }
        public static T DataGetSet<T>(this jQuery j, JsString name, T value)
        {
            var val = value.As<object>();
            var value2 = j.data(name);
            if (value2 == val)
                return value2.As<T>();
            j.data(name, val);
            return value2.As<T>();
        }
        public static JsString Prop<T>(JsNativeFunc<T, object> prop)
        {
            JsString code;
            if (prop.As<JsObject>()["isDelegate"].As<bool>())
                code = prop.As<JsObject>()["func"].As<JsObject>().toString();
            else
                code = prop.As<JsObject>().toString();
            return code.substringBetween(".", ";");
        }
        public static JsString ItemProp<T>(this JsArray<T> list, JsNativeFunc<T, object> prop)
        {
            return Utils.Prop<T>(prop);
        }
        public static JsFunc<T, V> ItemGetter<T, V>(this JsArray<T> list, JsFunc<T, V> prop)
        {
            return prop;
        }
    }


    [JsType(JsMode.Prototype, Export = false, Name = "Comparer")]
    public class Comparer<T>
    {
        public JsNumber compare(T x, T y) { return null; }
        public static Comparer<T> _default { get; set; }


    }


}