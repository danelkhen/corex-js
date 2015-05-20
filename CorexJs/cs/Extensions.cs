using corexjs;
using System;

namespace SharpKit.JavaScript
{

    [JsType(JsMode.Prototype, Export = false)]
    public static class Extensions
    {
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArrayDiff<T> diff<T>(this JsArray<T> list, JsArray<T> list2) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool itemsEqual<T>(this JsArray<T> list, JsArray<T> list2) { return false; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool remove<T>(this JsArray<T> list, T item) { return false; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static void removeAt<T>(this JsArray<T> list, JsNumber index) { }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static void insert<T>(this JsArray<T> list, JsNumber index, T item) { }

        [JsMethod(ExtensionImplementedInInstance = true, OmitCalls = true)]
        public static JsArray<T> ItemAs<T>(this System.Collections.IEnumerable list) { return null; }

        [JsMethod(InlineCodeExpression = "x instanceof Array")]
        public static bool IsArray(this object x) { return false; }
        [JsMethod(InlineCodeExpression = "typeof(x)")]
        public static JsString getTypeName(this object x) { return null; }
        [JsMethod(InlineCodeExpression = "typeof(x)")]
        public static JsTypes getType(this object x) { return default(JsTypes); }
        [JsMethod(InlineCodeExpression = "isNaN(x)")]
        public static bool IsNaN(this JsNumber x) { return false; }
        [JsMethod(InlineCodeExpression = "typeof(x)=='undefined'")]
        public static bool IsUndefined(this object x) { return false; }
        [JsMethod(InlineCodeExpression = "typeof(x)=='string'")]
        public static bool IsString(this object x) { return false; }
        [JsMethod(InlineCodeExpression = "typeof(x)=='number'")]
        public static bool IsNumber(this object x) { return false; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsNumber round(this JsNumber x, double precision) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsString removeDoubleWhitespace(this JsString s) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static void mapAsyncParallel<T, R>(this JsArray<T> list, JsAction<T, JsAction<R>> action, JsAction<JsArray<R>> finalCallback) { }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static void forEachAsyncParallel<T>(this JsArray<T> list, JsAction<T, JsAction> action, JsAction finalCallback) { }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static void joinWith<T, T2, K, R>(this JsArray<T> list, JsArray<T2> list2, JsFunc<T, K> keySelector1, JsFunc<T2, K> keySelector2, JsFunc<JsArrayWithKey<K, T>, JsArrayWithKey<K, T2>, R> resultSelector) { }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static void clear<T>(this JsArray<T> list) { }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static void forEachAsyncProgressive<T>(this JsArray<T> list, JsAction<T, JsAction> action, JsAction finalCallback) { }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> toArray<T>(this JsArray<T> list) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> exceptNulls<T>(this JsArray<T> list) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<R> select<T, R>(this JsArray<T> list, JsFunc<T, R> selector) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<R> select<T, R>(this JsArray<T> list, JsFunc<T, int, R> selector) { return null; }
        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static JsArray<R> select<T, R>(this JsArray<T> list, JsString s) { return null; }
        //[Obsolete]
        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static JsArray<object> select<T>(this JsArray<T> list, JsString s) { return null; }
        //[Obsolete]
        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static JsArray<R> selectMany<T, R>(this JsArray<T> list, JsString s) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<R> selectMany<T, R>(this JsArray<T> list, JsFunc<T, JsArray<R>> selector) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool contains<T>(this JsArray<T> list, T item) { return false; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArrayWithKey<K, JsArray<T>> groupBy<T, K>(this JsArray<T> list, JsFunc<T, K> keySelector) { return null; }

        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static JsArray<JsArray<T>> groupBy<T>(this JsArray<T> list, JsString s) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> distinct<T>(this JsArray<T> list) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool any<T>(this JsArray<T> list, JsFunc<T, bool> predicate) { return false; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool all<T>(this JsArray<T> list, JsFunc<T, bool> predicate) { return false; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> orderBy<T, V>(this JsArray<T> list, JsFunc<T, V> selector) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> orderBy<T, V>(this JsArray<T> list, JsArray<JsFunc<T, V>> selectors) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> orderByDescending<T, V>(this JsArray<T> list, JsFunc<T, V> predicate) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> where<T>(this JsArray<T> list, JsFunc<T, bool> predicate) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static void removeAll<T>(this JsArray<T> list, JsFunc<T, bool> predicate) { }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static T max<T>(this JsArray<T> list) { return default(T); }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static T min<T>(this JsArray<T> list) { return default(T); }

        [Obsolete]
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> whereEq<T>(this JsArray<T> list, JsString name, object value) { return null; }

        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static JsArray<T> whereEq<T, V>(this JsArray<T> list, JsFunc<T,V> prop, V value) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsNumber round(this JsNumber x) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsNumber sum<T>(this JsArray<T> list) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsNumber avg<T>(this JsArray<T> list) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static T first<T>(this JsArray<T> list) { return default(T); }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static T first<T>(this JsArray<T> list, JsFunc<T, bool> predicate) { return default(T); }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static T last<T>(this JsArray<T> list) { return default(T); }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsObject<K, V> selectToObject<T, K, V>(this JsArray<T> list, JsFunc<T, K> keySelector, JsFunc<T, V> valueSelector) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsObject<V> selectToObject<T, V>(this JsArray<T> list, JsFunc<T, JsString> keySelector, JsFunc<T, V> valueSelector) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool startsWith(this JsString s, JsString find) { return false; }


        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool endsWith(this JsString s, JsString find) { return false; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool startsWith(this string s, string find) { return false; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsString substringBetween(this JsString s, JsString start, JsString end) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsString substringBetween(this JsString s, JsString start, JsString end, JsNumber fromIndex) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsString replaceAll(this JsString s, JsString find, JsString replace) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool contains(this JsString s, JsString find) { return false; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<JsString> lines(this JsString s) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> skip<T>(this JsArray<T> list, int skip) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> take<T>(this JsArray<T> list, int take) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> insert<T>(this JsArray<T> list, int index, T iteam) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> add<T>(this JsArray<T> list, T item) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsArray<T> addRange<T>(this JsArray<T> list, JsArray<T> items) { return null; }

        [JsMethod(ExtensionImplementedInInstance = true)]
        public static JsString format(this JsNumber x, JsString format) { return null; }

    }


    [JsType(JsMode.Json)]
    public class JsArrayDiff<T>
    {
        public JsArray<T> added { get; set; }
        public JsArray<T> removed { get; set; }

    }

}