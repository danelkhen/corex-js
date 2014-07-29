using SharpKit.JavaScript;
using System;

namespace CorexJs
{
    [JsType(JsMode.Prototype, Name = "Object", Export = false)]
    public static class JsObjectExt
    {
        public static JsArray<JsString> keys(this object obj) { return null; }
        public static void forEach(this object obj, Action<JsString, object> action) { }
        public static void forEach<T>(this JsObject<T> obj, Action<JsString, T> action) { }
        public static object tryGet(this object obj, JsString path) { return null; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool contains<T>(this JsArray<T> list, T obj) { return false; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool addRange<T>(this JsArray<T> list, JsArray<T> items) { return false; }

        public static void trySet(this object obj, JsString path, object value) { }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool startsWith(this JsString s, JsString start) { return false; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool endsWith(this JsString s, JsString end) { return false; }
        [JsMethod(ExtensionImplementedInInstance = true)]
        public static bool contains(this JsString s, JsString sub) { return false; }
    }
    [JsType(JsMode.Prototype, Name = "Q", Export = false)]
    public static class Q
    {
        public static bool isNullOrEmpty(this JsString obj) { return false; }
        public static bool isNotNullOrEmpty(this JsString obj) { return false; }
    }



    //[JsType(JsMode.Prototype, Name = "Object", Filename ="~/res/databind.js")]
    //public static class JsObjectExt2
    //{
    //    public static void map<T, R>(this JsObject<T> obj, JsFunc<JsString, T, R> func)
    //    {

    //    }
    //}

}