using SharpKit.JavaScript;
using System;

namespace tidytree
{
    [JsType(JsMode.Prototype, IgnoreGenericTypeArguments = true)]
    public static class Extensions
    {
        static Extensions()
        {
            _hashKeyPrefix = "hashkey\0";
            _hashKeyIndex = 0;
        }
        static JsString _hashKeyPrefix = "hashkey\0";
        static JsNumber _hashKeyIndex = 0;
        public static JsString GetHashKey(this object obj2)
        {
            dynamic obj = obj2;
            if (obj == JsContext.undefined)
                return "undefined";
            if (obj == null)
                return "null";
            if (obj.valueOf)
                obj = obj.valueOf();
            var type = JsContext.@typeof(obj);
            if (type == "string")
                return obj.As<JsString>();
            if (type == "object" || type == "function")
            {
                if (obj._hashKey == null)
                {
                    obj._hashKey = _hashKeyPrefix + _hashKeyIndex;
                    _hashKeyIndex++;
                }
                return obj._hashKey;
            }
            return obj.toString();

        }

        public static TAccumulate Aggregate<TSource, TAccumulate>(this JsArray<TSource> source, TAccumulate seed, Func<TAccumulate, TSource, TAccumulate> func)
        {
            TAccumulate tAccumulate = seed;
            foreach (TSource current in source)
            {
                tAccumulate = func(tAccumulate, current);
            }
            return tAccumulate;
        }
    }
}
