using SharpKit.JavaScript;

namespace corexjs
{
    [JsType(JsMode.Prototype, Name = "Q", Export = false)]
    public static class Q
    {
        public static bool isNullOrEmpty(this JsString obj) { return false; }
        public static bool isNotNullOrEmpty(this JsString obj) { return false; }
    }
}
