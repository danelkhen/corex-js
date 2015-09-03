namespace SharpKit.JavaScript
{
    [JsType(JsMode.Json, Export = false)]
    public interface IJsIterator<T>
    {
        IJsIteratorItem<T> next();
    }

    [JsType(JsMode.Json, Export = false)]
    public interface IJsIteratorItem<T>
    {
        T value { get; }
        bool done { get; }
    }

}