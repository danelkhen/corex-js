using SharpKit.JavaScript;
using corexjs;

namespace tidytree
{
    [JsType(JsMode.Prototype)]
    public class JsDictionary<K, T>
    {
        public JsDictionary()
        {
            Obj = new JsObject<JsString, T>();
            Count = 0;
            KeyGen = k => k.GetHashKey();
        }
        public JsFunc<K, JsString> KeyGen { get; set; }
        public JsObject<JsString, T> Obj { get; private set; }
        public void Clear()
        {
            Obj = new JsObject<JsString, T>();
            Count = 0;
        }
        public void Add(K key, T value)
        {
            var k = KeyGen(key);
            if (Obj.hasOwnProperty(k))
                throw new JsNativeError();
            Obj[k] = value;
            Count++;
        }
        public T this[K key]
        {
            get
            {
                var k = KeyGen(key);
                if (!Obj.hasOwnProperty(k))
                    throw new JsNativeError();
                return Obj[k];
            }
        }

        public int Count { get; private set; }

        public JsArray<T> Values
        {
            get
            {
                return JsObjectEx.values(Obj).As<JsArray<T>>();
            }
        }

    }


}

