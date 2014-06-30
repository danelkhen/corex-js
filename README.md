corex-js
========

Core extensions and utility functions for js and mini databinding framework (Booking.com hackathon project)


#### DataBinding

##### Terminology
Source - The raw data object that you're trying to visualize, can be found on any element
```
var source = $(el).data("source");    //use this to access the Source
```
Target - The html element that shows your data source visually

DataBind - An recursive event that updates the target to visualize your source properly
```
$(el).databind();                         //to fire the event
$(el).on("databind", function(e) { } );   //to attach to the event
```
In markup, 'this' designates the current element, source is the Source :-)
```
<input data-onbind="this.value = source.name;" />
```
DataBindBack - An recursive event that updates the source to reflect any changes made by the user on the Target
```
$(el).databindback();                         //to fire the event
$(el).on("databindback", function(e) { } );   //to attach to the event
```
In Markup:
```
<input data-onbindback="source.name = this.value;" />
```
OneWay - Perfoming DataBinding from the Source to the Target only, never the other way around

PassDown - Passing of the Source on a Target to a Target's children

Binding - An object handling the DataBind and DataBindBack events for a specific Target

DataParent - The topmost element from a specific element that still has the same Source as the current element, useful when wanting to update the entire UI related to a Source.
```
$(el).dataparent()
```
 

