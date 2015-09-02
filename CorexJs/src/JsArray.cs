using SharpKit.JavaScript;

namespace corexjs
{
    [JsType(JsMode.Prototype, Export = false, Name = "Array")]
    public class JsArrayEx : JsArray
    {
        public static JsArray<JsNumber> generateNumbers(int p1, int p2) { return null; }
    }
    [JsType(JsMode.Prototype, Export = false, Name = "Array")]
    public class JsArrayWithKey<K, T> : JsArray<T>
    {
        public K key { get; set; }
    }
}
