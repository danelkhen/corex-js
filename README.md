corex-js
========

Core extensions and utility functions for js and mini databinding framework (Booking.com hackathon project)


#### DataBinding

##### Terminology
* Source - The raw data object that you're trying to visualize, can be found on any element, can be accessed via $(el).data("source")
* Target - The html element that shows your data source visually
* DataBind - An recursive event that updates the target to visualize your source properly, can be fired using $(el).databind()
* DataBindBack - An recursive event that updates the source to reflect any changes made by the user on the Target, can be fired using $(el).databindback()
* OneWay - Perfoming DataBinding from the Source to the Target only, never the other way around
* PassDown - Passing of the Source on a Target to a Target's children
* Binding - An object handling the DataBind and DataBindBack events for a specific Target
* DataParent - The topmost element from a specific element that still has the same Source as the current element, can be evaluated using $(el).dataparent(), useful when wanting to update the entire UI related to a Source.
 

