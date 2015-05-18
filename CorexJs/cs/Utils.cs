using SharpKit.JavaScript;
using System;

namespace corexjs
{
    [JsType(JsMode.Prototype)]
    public static class Utils
    {
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
    }


}