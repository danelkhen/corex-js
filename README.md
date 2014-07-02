corex-js
========

Core extensions and utility functions for js and mini databinding framework (Booking.com hackathon project)


#### DataBinding

##### Terminology
###### Source
The raw data object that you're trying to visualize, can be found on any element
```
var source = $(el).datasource();    //use this to access the Source
```
###### Target
The html element that shows your data source visually

###### SourcePath
A string path that navigates to the desired property on a source

###### TargetPath
A string path that navigates to the desired property on a target

###### DataBind
An recursive event that updates the target to visualize your source properly
```
$(el).databind();                         //to fire the event
$(el).on("databind", function(e) { } );   //to attach to the event
```
In markup, 'this' designates the current element, source is the Source :-)
```
<input data-onbind="this.value = source.name;" />
```
###### DataBindBack
A recursive event that updates the source to reflect any changes made by the user on the Target
```
$(el).databindback();                         //to fire the event
$(el).on("databindback", function(e) { } );   //to attach to the event
```
In markup:
```
<input data-onbindback="source.name = this.value;" />
```
###### OneWay
Perfoming DataBinding from the Source to the Target only, never the other way around

###### PassDown
Passing of the Source on a Target to a Target's children

###### Binder
An object handling the DataBind and DataBindBack events for a specific Target. The 'return' statement can be omitted, and shortcuts are provided with BindersContext instance.
In markup:
```
<input data-binders="[onchange('name')]" />
```
This will call BindersContext.onchange('name') - a shortcut function that creates a twoway binder with an element.onchange trigger to bindback.

###### DataParent
The topmost element from a specific element that still has the same Source as the current element, useful when wanting to update the entire UI related to a Source.
```
$(el).dataparent()
```

###### Triggers
The events on the Target that should cause a certain Binder to fire a DataBindBack event.
 

