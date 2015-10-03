using SharpKit.JavaScript;
using System;

namespace corexjs
{
    [JsType(JsMode.Prototype, Name = "Object", Export = false)]
    public static class JsObjectEx
    {
        public static JsArray<JsString> keys(object obj) { return null; }
        public static JsArray<JsString> keys(this JsObject obj) { return null; }
        public static JsArray<K> keys<K,T>(this JsObject<K,T> obj) { return null; }
        public static JsArray<T> values<K, T>(this JsObject<K, T> obj) { return null; }
        public static JsArray<T> values<T>(this JsObject<T> obj) { return null; }
        public static JsArray<object> values(object obj) { return null; }
        public static JsString getHashKey(object obj) { return null; }
        public static void forEach(object obj, JsAction<JsString, object> action) { }
        public static void forEach<T>(this JsObject<T> obj, JsAction<JsString, T> action) { }
        public static object tryGet(object obj, JsString path) { return null; }
        public static object tryGet(object obj, JsArray<JsString> path) { return null; }
        public static void trySet(object obj, JsString path, object value) { }

        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static bool contains<T>(this JsArray<T> list, T obj) { return false; }
        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static bool addRange<T>(this JsArray<T> list, JsArray<T> items) { return false; }

        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static bool startsWith(this JsString s, JsString start) { return false; }
        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static bool endsWith(this JsString s, JsString end) { return false; }
        //[JsMethod(ExtensionImplementedInInstance = true)]
        //public static bool contains(this JsString s, JsString sub) { return false; }
    }
}
