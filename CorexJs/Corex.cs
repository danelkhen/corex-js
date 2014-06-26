using SharpKit.JavaScript;
using System;

namespace CorexJs
{
    [JsType(JsMode.Prototype, Name = "Object", Export = false)]
    public static class JsObjectExt
    {
        public static void forEach(this object obj, Action<JsString, object> action) { }
        public static void forEach<T>(this JsObject<T> obj, Action<JsString, T> action) { }
        public static object tryGet(this object obj, JsString path) { return null; }
        [JsMethod(ExtensionImplementedInInstance =true)]
        public static bool contains<T>(this JsArray<T> list, T obj) { return false; }

        public static void trySet(this object obj, JsString path, object value) { }
    }
}