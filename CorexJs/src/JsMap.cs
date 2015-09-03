
namespace SharpKit.JavaScript
{
    [JsType(JsMode.Prototype, Name = "Map", Export = false)]
    public class JsMap<K, T>
    {
        public JsNumber size { get; private set; }
        ///Removes all elements from a map.
        public void clear() { }
        ///Removes a specified element from a map.
        public void delete(K key) { }
        ///Performs the specified action for each element in a map.
        public void forEach(JsAction<T, K> cb) { }
        ///Returns a specified element from a map.
        public T get(K key) { return default(T); }
        public T this[K key]
        {
            [JsMethod(Name = "get")]
            get
            { return default(T); }
            [JsMethod(Name = "set")]
            set
            { }
        }
        ///Returns true if the map contains a specified element.
        public bool has(K key) { return false; }
        ///Adds a new element to a map.
        public void set(K key, T value) { }
        ///Returns a string representation of a map.
        public JsString toString() { return null; }
        ///Returns the primitive value of the specified object.
        public object valueOf() { return null; }

        public IJsIterator<T> values() { return null; }
    }
}