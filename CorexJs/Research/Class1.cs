using CorexJs.DataBinding;
using SharpKit.JavaScript;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CorexJs.Research
{
    [JsType(JsMode.Json)]
    public class InstanceProperty
    {
        public object instance { get; set; }
        public JsFunc<object> get { get; set; }
        public JsAction<object> set { get; set; }
    }

    [JsType(JsMode.Prototype, Export = false)]
    public interface IReflector
    {
        object GetValue(object obj, string property);
        void SetValue(object obj, string property, object value);
        JsArray<Property> GetProperties(object obj);
        Property GetProperty(object obj, string property);
        InstanceProperty GetInstanceProperty(object obj, string property);
    }


    class JsonReflector : IReflector
    {
        public InstanceProperty GetInstanceProperty(object obj, string property)
        {
            return new InstanceProperty { instance = obj, get = () => GetValue(obj, property), set = v => SetValue(obj, property, v) };
        }

        public JsArray<Property> GetProperties(object obj)
        {
            return obj.keys().map(t => GetProperty(obj, t));
        }

        public Property GetProperty(object obj, string property)
        {
            return new Property { get = t => GetValue(t, property), set = (t, v) => SetValue(t, property, v) };
        }

        public object GetValue(object obj, string property)
        {
            return obj.As<JsObject>()[property];
        }

        public void SetValue(object obj, string property, object value)
        {
            obj.As<JsObject>()[property] = value;
        }
    }
}