using SharpKit.JavaScript;
using corexjs;

namespace CorexJs
{
    [JsType(JsMode.Prototype, Name = "Dictionary", Filename ="~/dictionary.js", Export =false)]
    public class JsDictionary<K, T>
    {
        public JsDictionary()
        {
            _obj = new JsObject<JsString, T>();
            count = 0;
            keyGen = new JsNativeFunc<object, JsString>(JsObjectEx.getHashKey).As<JsFunc<K, JsString>>();
        }
        public JsFunc<K, JsString> keyGen { get; set; }
        JsObject<JsString, T> _obj;
        public void clear()
        {
            _obj = new JsObject<JsString, T>();
            count = 0;
        }
        public void add(K key, T value)
        {
            var k = keyGen(key);
            if (_obj.hasOwnProperty(k))
                throw new JsNativeError();
            _obj[k] = value;
            count++;
        }
        public T this[K key]
        {
            [JsMethod(Name = "get")]
            get
            {
                var k = keyGen(key);
                if (!_obj.hasOwnProperty(k))
                    throw new JsNativeError();
                return _obj[k];
            }
            [JsMethod(Name = "set")]
            set
            {
                var k = keyGen(key);
                _obj[k] = value;
            }
        }

        public JsNumber count { get; private set; }

        public JsArray<T> values()
        {
            return JsObjectEx.values(_obj).As<JsArray<T>>();
        }

    }
}