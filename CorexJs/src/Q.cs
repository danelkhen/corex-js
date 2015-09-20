using SharpKit.JavaScript;

namespace corexjs
{
    [JsType(JsMode.Prototype, Name = "Q", Export = false)]
    public static class Q
    {
        public static bool isNotNullOrEmpty(this JsString s) { return false; }
        public static bool isNullOrEmpty(this JsString s) { return false; }
        public static bool isNullOrEmpty(this string s) { return false; }
        public static bool isNullOrEmpty<T>(this JsArray<T> s) { return false; }
        public static bool isNotNullOrEmpty<T>(this JsArray<T> s) { return false; }
        public static JsFunc<T, R> createSelectorFunction<T, R>(JsString selector) { return null; }

        public static T copy<T>(T from, T to, CopyOptions options) { return default(T); }
        public static T copy<T>(T from, T to) { return default(T); }
        public static T copy<T>(T from) { return default(T); }
    }

    [JsType(JsMode.Json)]
    public class CopyOptions
    {
        public bool overwrite { get; set; }
    }

}
