"use strict"

var _templates = {};

function main() {
    //test2.callAmp({ name: "shooki", age: 7 });
    //return;
    main3();
}

                            
function main3() {
    var total = 20;
    var el;
    var data = { contacts: [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }] };
    for (var i = 0; i < total; i++) {
        data.contacts.push(Q.copy(data.contacts[0]));
    }
    var x = test2.callAmp(data);
    //document.body.appendChild(x);
    return;
    var node;
    console.log("compile");
    time(function () {
        node = compileFakeFunction(test2);
    });
    console.log("bind");
    time(function () {
        node.bindArgs([data]);
    });
    console.log("Process");
    time(function () {
        //el = node.process();
        //$("body").setChildNodes(node.process().toChildNodes());
        node.process();
        //$("input").css({ backgroundColor: "pink" });
        //$("div").css({ backgroundColor: "red" });
    });
    //$("div").css({backgroundColor:"red"})
    window.setTimeout(function () {
        console.log("Process again");
        time(function () {
            node.process();
            //$("body").setChildNodes(el);
        });
        //window.setTimeout(function () {
        //    time(function () {
        //        data.contacts.removeAt(0);
        //        data.contacts[0].name = "gggggggggggggggg";
        //        data.contacts.push({ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] });
        //        data.contacts.push({ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] });
        //        data.contacts.push({ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] });
        //        //var data = { contacts: [{ name: "shooki", phones: [{ number: "06-42342342" }, { number: "06-99999999" }] }, { name: "booki", phones: [] }] };
        //        el = node.process();
        //        $("body").setChildNodes(el);
        //    });
        //}, 1000);
    }, 1000);
}
function time(action) {
    var start = new Date();
    action();
    var end = new Date();
    console.log(end.valueOf() - start.valueOf() + "ms");
}

function shallowCopy(src, dest) {
    return $.extend(dest || {}, src);
}

function compile(markup, root) {
    var compiler = new HierarchyCompiler();
    var nodes = compiler.parse(markup, root);
    if (root == null && nodes.length == 1) {
        root = nodes[0];
    }
    else {
        if (root == null) {
            root = {};
        }
        if (root.ctx == null) {
            root.ctx = {};
            nodes.forEach(node => shallowCopy(node.ctx, root.ctx));
        }
        if (root.funcPrms == null)
            root.funcPrms = nodes.selectMany("funcPrms").distinct();
        root.children = nodes;
        if (root.func == null)
            root.func = function (ctx) { 
                return this.invisible(); 
            };
    }
    if (root.nodeProcessorGen == null)
        root.nodeProcessorGen = node => new HControl(node);
    var root2 = new HNode(root);
    //root2.children = nodes.select(t=>new HNode(t));
    return root2;
}

Function.prototype.callAmp = function (varargs) {
    var node = compileFakeFunction(this);
    node.bindArgs(Array.from(arguments));
    var res = node.process();
    return res;
}
Function.prototype.applyAmp = function (args) {
    var node = compileFakeFunction(this);
    node.bindArgs(args);
    var res = node.process();
    return res;
}

Function.prototype.toAmp = function () {
    return toAmpFunction(this);
}
function toAmpFunction(fakeFunc) {
    if (fakeFunc.compiledNode != null)
        return fakeFunc.compiledNode.toFunction();
    var node = compileFakeFunction(fakeFunc);
    return node.toFunction();
}
function compileFakeFunction(func) {
    if (func.compiledNode != null)
        return func.compiledNode;
    var funcInfo = FunctionHelper.parse(func.toString());
    var ctx = {};
    funcInfo.prms.forEach(prm => ctx[prm] = null);
    var node = compile(funcInfo.body, { funcPrms: funcInfo.prms, ctx: ctx });
    func.compiledNode = node;
    return func.compiledNode;
}


/*
detail( { class: "Rfo" })
    div( { class: "container-fluid" })
        h1()
            "{ t.title }"
        h3()
            author( { name: "{t.changed_by}" })
            small()
                span( { class: "label label-primary" })
                    "{t.status}"
                span( { class: "label label-primary" })
                    "{ t.created }"
                span( { each: "{ t.tags }", class: "Tag label label-info" })
                    "{t.name}"
        div()
            span()
                strong()
                    "Started: "
            span()
                "{ t.outage_start }"
        div()
            span()
                strong()
                    "Detected in: "
            span()
                "{ ctl.renderDuration(t.outage_start, t.detected_at) }"
        div()
            span()
                strong()
                    "Resolved in: "
            span()
                "{ ctl.renderDuration(t.detected_at, t.resolved_at) }"
        #comment()
        div()
            span( { class: "pre" })
                "{ t.summary }"
            a( { class: "Action", onclick: "{$(e.target).parent().next('.Edit').toggle()}" })
                "Edit"
        form( { class: "form-horizontal Edit", style: "display:none" })
            div( { class: "form-group form-group-sm" })
                label( { class: "col-sm-1 control-label" })
                    "title:"
                div( { class: "col-sm-5" })
                    input( { placeholder: "title", value: "{t.title}", onchange: "{t.title = e.target.value}", class: "form-control" })
            div( { class: "form-group form-group-sm" })
                label( { class: "col-sm-1 control-label" })
                    "tags:"
                div( { class: "col-sm-5" })
                    select( { placeholder: "tags", multiple: "multiple", onchange: "{t.tags = ctl.parseTags($(e.target).val())}", class: "form-control", do-after: "{$(el).val(t.tags.select('id'))}{$(el).chosen({width:'100%'})},0)}" })
                        option( { each: "{ctl.tags}", value: "{t.id}" })
                            "{t.name}"
            div( { class: "form-group form-group-sm" })
                label( { class: "col-sm-1 control-label" })
                    "status:"
                div( { class: "col-sm-5" })
                    select( { name: "status", do-after: "{el.value = t.status}", onchange: "{t.status = e.target.value}", class: "form-control" })
                        option( { value: "draft" })
                            "draft"
                        option( { value: "published" })
                            "published"
                        option( { value: "sent_to_live" })
                            "sent_to_live"
            div( { class: "form-group form-group-sm" })
                label( { class: "col-sm-1 control-label" })
                    "summary:"
                div( { class: "col-sm-5" })
                    textarea( { placeholder: "summary", onchange: "{t.summary = e.target.value}", class: "form-control" })
                        "{t.summary}"
            div( { class: "form-group form-group-sm" })
                label( { class: "col-sm-1 control-label" })
                    "outage start"
                div( { class: "col-sm-5" })
                    input( { value: "{t.outage_start}", placeholder: "outage start", onchange: "{t.outage_start = e.target.value}", do: "{ctl.datePicker(el)}", class: "form-control" })
            div( { class: "form-group form-group-sm" })
                label( { class: "col-sm-1 control-label" })
                    "detected at: "
                div( { class: "col-sm-5" })
                    input( { value: "{ t.detected_at }", placeholder: "Detected at", onchange: "{t.detected_at = e.target.value}", do: "{ctl.datePicker(el)}", class: "form-control" })
            div( { class: "form-group form-group-sm" })
                label( { class: "col-sm-1 control-label" })
                    "resolved at: "
                div( { class: "col-sm-5" })
                    input( { value: "{t.resolved_at}", placeholder: "Resolved at", onchange: "{t.resolved_at = e.target.value}", do: "{ctl.datePicker(el)}", class: "form-control" })
            div( { class: "form-group form-group-sm" })
                div( { class: "col-sm-offset-1 col-sm-5" })
                    button( { class: "btn btn-primary", onclick: "{ctl.saveRfo()}" })
                        "Save"
        hr()
        div( { id: "symptoms" })
            h3()
                "Symptoms & Detection"
            span( { id: "symptoms-detection-help", class: "help-block" })
                "How did the problem manifest? How was it detected?"
            div()
                div()
                    "{ $(marked(t.symptoms_detection)) }"
                a( { class: "Action", onclick: "{$(e.target).parent().next('.Edit').toggle()}" })
                    "Edit"
            div( { class: "Edit", style: "display:none" })
                textarea( { aria-describedby: "symptoms-detection-help", rows: "10", onchange: "{t.symptoms_detection = e.target.value}", class: "form-control markdown" })
                    "{t.symptoms_detection}"
                button( { class: "btn btn-primary", onclick: "{ctl.saveRfo()}" })
                    "Save"
        hr()
        div( { id: "root-cause" })
            h3()
                "Root Cause"
            span( { id: "root-cause-help", class: "help-block" })
                "How did the outage happen?"
            div()
                div()
                    "{ $(marked(t.root_cause)) }"
                a( { class: "Action", onclick: "{$(e.target).parent().next('.Edit').toggle()}" })
                    "Edit"
            div( { class: "Edit", style: "display:none" })
                textarea( { aria-describedby: "root-cause-help", rows: "10", onchange: "{t.root_cause = e.target.value}", class: "form-control markdown" })
                    "{t.root_cause}"
                button( { class: "btn btn-primary", onclick: "{ctl.saveRfo()}" })
                    "Save"
        hr()
        div( { id: "corrective-action" })
            h3()
                "Corrective Action"
            span( { id: "corrective-action-help", class: "help-block" })
                "How was the outage resolved?"
            div()
                span()
                    "{ $(marked(t.corrective_action)) }"
                a( { class: "Action", onclick: "{$(e.target).parent().next('.Edit').toggle()}" })
                    "Edit"
            div( { class: "Edit", style: "display:none" })
                textarea( { aria-describedby: "corrective-action-help", rows: "10", onchange: "{t.corrective_action = e.target.value}", class: "form-control markdown" })
                    "\n                    {t.corrective_action}\n                "
                button( { class: "btn btn-primary", onclick: "{ctl.saveRfo()}" })
                    "Save"
        hr()
        div( { id: "solve-underlying-problem" })
            h3()
                "How could we eliminate this class of outage?"
            span( { id: "solve-underlying-problem-help", class: "help-block" })
                "Favor proactive (fix a tool, automate a process) over reactive (improve monitoring)."
            div()
                div()
                    "{ $(marked(t.solve_underlying_problem)) }"
                a( { class: "Action", onclick: "{$(e.target).parent().next('.Edit').toggle()}" })
                    "Edit"
            div( { class: "Edit", style: "display:none" })
                textarea( { aria-describedby: "solve-underlying-problem-help", rows: "10", onchange: "{t.solve_underlying_problem = e.target.value}", class: "form-control markdown" })
                    "{t.solve_underlying_problem}"
                button( { class: "btn btn-primary", onclick: "{ctl.saveRfo()}" })
                    "Save"
        hr()
        div( { id: "monitoring-effectiveness" })
            h3()
                "How effective was the monitoring?"
            span( { id: "monitoring-effectiveness", class: "help-block" })
                "Was there an alert from a machine? Did the alert reach a human? Did the alert help identify the problem? Did the alert trigger thousands of times?"
            div()
                div()
                    "{ $(marked(t.monitoring_effectiveness)) }"
                a( { class: "Action", onclick: "{$(e.target).parent().next('.Edit').toggle()}" })
                    "Edit"
            div( { class: "Edit", style: "display:none" })
                textarea( { aria-describedby: "monitoring-effectiveness-help", rows: "10", onchange: "{t.monitoring_effectiveness = e.target.value}", class: "form-control" })
                    "\n                    {t.monitoring_effectiveness}\n                "
                button( { class: "btn btn-primary", onclick: "{ctl.saveRfo()}" })
                    "Save"
        hr()
        div( { id: "timeline", class: "Events" })
            h3()
                "Events"
            div( { each: "{ t.eventsByDay }" })
                div()
                    "{t.key}"
                div( { each: "{ t }", class: "Event{t.isOpened?' Expanded':''}" })
                    div()
                        a( { onclick: "{ctl.toggleEvent(e.target, t)}" })
                            "{ ctl.formatDate(t.timestamp, 'HH:mm') } - { t.description }"
                        span( { each: "{ t.tags }", class: "label label-info" })
                            "{t.name}"
                        span( { if: "{ t.comments.length>0 }" })
                            span( { class: "label label-info" })
                                "{t.comments.length} comments"
                        span( { class: "Actions" })
                            a( { class: "Action", if: "{ctl.editable}", onclick: "{ctl.editEvent(t, e)}" })
                                "Edit"
                            a( { class: "Action", if: "{ctl.editable}", onclick: "{ctl.deleteEvent(t)}" })
                                "Delete"
                    div( { class: "Details" })
                        div( { class: "EditPanel", if: "{ctl.editable && ctl.editableEventId==t.id}" })
                            h4()
                                "Edit Event"
                            div( { onsave: "{ctl.editEventSave(e.t)}", oncancel: "{ctl.editEventCancel()}" })
                                div( { amp-tag: "eventedit" })
                        div( { each: "{ t.comments }", class: "Comment" })
                            span()
                                "{t.created} - {t.text} ("
                                author( { name: "{t.changed_by}" })
                                "{t.created} - {t.text} ("
                            a( { class: "Action", if: "{ctl.editable}", onclick: "{ctl.editEventComment(t, e)}" })
                                "Edit"
                            a( { class: "Action", if: "{ctl.editable}", onclick: "{ctl.deleteEventComment(t)}" })
                                "Delete"
                            div( { class: "EditPanel", if: "{ctl.editable && ctl.editableEventCommentId==t.id}" })
                                h4()
                                    "Edit Event Comment"
                                div( { onsave: "{ctl.editEventCommentSave(e.t)}", oncancel: "{ctl.editEventCommentCancel()}" })
                                    div( { amp-tag: "commentedit" })
                        div()
                            a( { class: "Action", onclick: "{$(e.target).closest('.Event').find('.CommentEdit').toggle()}" })
                                "Comment"
                        div( { class: "CommentEdit", style: "display:none;", onsave: "{ctl.addEventComment(t, e.t)}" })
                            div( { do: "{t = null}" })
                                div( { amp-tag: "commentedit" })
            div( { if: "{ctl.editable}", class: "AddEvent", onsave: "{ctl.addEvent(e.t)}", oncancel: "{$(el).find('.EventEdit').hide()}", do: "{t = null}" })
                div()
                    a( { class: "Action", onclick: "{$(e.target).closest('.AddEvent').find('.EventEdit').toggle()}" })
                        "Add an Event"
                div( { do: "{t=ctl.newEvent}", class: "EventEdit", style: "display:none" })
                    div( { amp-tag: "eventedit" })
        hr()
        div( { id: "follow-ups" })
            h3()
                "Follow ups"
            div()
                div( { each: "{ t.follow_ups }", class: "Followup" })
                    span()
                        "{t.created} {t.title}"
                    a( { href: "https://jira.booking.com/jira/browse/{t.jira_key}", target: "_blank" })
                        "{t.jira_key}"
                    span()
                        "{t.jira_status} ("
                        author( { name: "{t.changed_by}" })
                        "{t.jira_status} ("
                    #comment()
                div()
                    a( { class: "Action", onclick: "{$(e.target).next('.FollowupEdit').toggle()}" })
                        "Add a Followup"
                    div( { if: "{ctl.editable}", onsave: "{ctl.addFollowup(e.t)}", oncancel: "{ctl.addFollowupCancel()}", class: "FollowupEdit", style: "display:none" })
                        div( { do: "{t=null}" })
                            div( { amp-tag: "followupedit" })
        hr()
        div( { id: "impacts" })
            h3()
                "Impacts"
            div( { each: "{ t.impacts }", class: "Impact" })
                div()
                    "\n                    {t.created}\n                    {t.description}\n                    {t.value}\n                    ("
                    author( { name: "{t.changed_by}" })
                    "\n                    {t.created}\n                    {t.description}\n                    {t.value}\n                    ("
                    a( { href: "{t.supporting_url}", target: "_blank" })
                        "{t.supporting_url}"
                    "\n                    {t.created}\n                    {t.description}\n                    {t.value}\n                    ("
                    span( { class: "label label-info" })
                        "{t.category}"
                    "\n                    {t.created}\n                    {t.description}\n                    {t.value}\n                    ("
                    a( { class: "Action", if: "{ctl.editable}", onclick: "{ctl.editImpact(t, e)}" })
                        "Edit"
                    "\n                    {t.created}\n                    {t.description}\n                    {t.value}\n                    ("
                    a( { class: "Action", if: "{ctl.editable}", onclick: "{ctl.deleteImpact(t)}" })
                        "Delete"
                    "\n                    {t.created}\n                    {t.description}\n                    {t.value}\n                    ("
                div( { class: "EditPanel", if: "{ctl.editable && ctl.editableImpactId==t.id}" })
                    h4()
                        "Edit Impact"
                    div( { onsave: "{ctl.editImpactSave(e.t)}", oncancel: "{ctl.editImpactCancel()}" })
                        div( { amp-tag: "impactedit" })
            div()
                a( { class: "Action", onclick: "{$(e.target).next('.ImpactEdit').toggle()}" })
                    "Add an Impact"
                div( { if: "{ctl.editable}", onsave: "{ctl.addImpact(e.t)}", oncancel: "{$(e.currentTarget).toggle()}", class: "ImpactEdit", style: "display:none" })
                    div( { do: "{t=null}" })
                        div( { amp-tag: "impactedit" })
        hr()
        div( { id: "comments" })
            h3()
                "Comments"
            div( { each: "{ t.comments }", class: "Comments" })
                span()
                    "{t.created} - {t.text} ("
                    author( { name: "{t.changed_by}" })
                    "{t.created} - {t.text} ("
                a( { class: "Action", if: "{ctl.editable}", onclick: "{ctl.editComment(t, e)}" })
                    "Edit"
                a( { class: "Action", if: "{ctl.editable}", onclick: "{ctl.deleteComment(t)}" })
                    "Delete"
                div( { class: "EditPanel", if: "{ctl.editable && ctl.editableCommentId==t.id}" })
                    h4()
                        "Edit Comment"
                    div( { onsave: "{ctl.editCommentSave(e.t)}", oncancel: "{ctl.editCommentCancel()}" })
                        div( { amp-tag: "commentedit" })
            #comment()
            div( { if: "{ctl.editable}", onsave: "{ctl.addComment(e.t)}", oncancel: "{$(el).toggle()}", class: "CommentEdit" })
                div( { do: "{t=null}" })
                    div( { amp-tag: "commentadd" })
        hr()
*/


//var x = {
//    type: "detail",
//    content: [
//        {
//            type: "div",
//            content: [
//                {
//                    type: "h1",
//                    content: ["{ t.title }"]
//                },
//                {
//                    type: "h3",
//                    content: [
//                        {
//                            type: "author",
//                            attributes: {name: "{t.changed_by}"}
//                        },
//                        {
//                            type: "small",
//                            content: [
//                                {
//                                    type: "span",
//                                    content: ["{t.status}"],
//                                    attributes: {class: "label label-primary"}
//                                },
//                                {
//                                    type: "span",
//                                    content: ["{ t.created }"],
//                                    attributes: {class: "label label-primary"}
//                                },
//                                {
//                                    type: "span",
//                                    content: ["{t.name}"],
//                                    attributes: {each: "{ t.tags }",class: "Tag label label-info"}
//                                }
//                            ]
//                        }
//                    ]
//                },
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "span",
//                            content: [
//                                {
//                                    type: "strong",
//                                    content: ["Started: "]
//                                }
//                            ]
//                        },
//                        {
//                            type: "span",
//                            content: ["{ t.outage_start }"]
//                        }
//                    ]
//                },
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "span",
//                            content: [
//                                {
//                                    type: "strong",
//                                    content: ["Detected in: "]
//                                }
//                            ]
//                        },
//                        {
//                            type: "span",
//                            content: ["{ ctl.renderDuration(t.outage_start, t.detected_at) }"]
//                        }
//                    ]
//                },
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "span",
//                            content: [
//                                {
//                                    type: "strong",
//                                    content: ["Resolved in: "]
//                                }
//                            ]
//                        },
//                        {
//                            type: "span",
//                            content: ["{ ctl.renderDuration(t.detected_at, t.resolved_at) }"]
//                        }
//                    ]
//                },
//                {type: "#comment"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "span",
//                            content: ["{ t.summary }"],
//                            attributes: {class: "pre"}
//                        },
//                        {
//                            type: "a",
//                            content: ["Edit"],
//                            attributes: {class: "Action",onclick: "{$(e.target).parent().next('.Edit').toggle()}"}
//                        }
//                    ]
//                },
//                {
//                    type: "form",
//                    content: [
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "label",
//                                    content: ["title:"],
//                                    attributes: {class: "col-sm-1 control-label"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "input",
//                                            attributes: {placeholder: "title",value: "{t.title}",onchange: "{t.title = e.target.value}",class: "form-control"}
//                                        }
//                                    ],
//                                    attributes: {class: "col-sm-5"}
//                                }
//                            ],
//                            attributes: {class: "form-group form-group-sm"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "label",
//                                    content: ["tags:"],
//                                    attributes: {class: "col-sm-1 control-label"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "select",
//                                            content: [
//                                                {
//                                                    type: "option",
//                                                    content: ["{t.name}"],
//                                                    attributes: {each: "{ctl.tags}",value: "{t.id}"}
//                                                }
//                                            ],
//                                            attributes: {placeholder: "tags",multiple: "multiple",onchange: "{t.tags = ctl.parseTags($(e.target).val())}",class: "form-control","do-after": "{$(el).val(t.tags.select('id'))}{$(el).chosen({width:'100%'})},0)}"}
//                                        }
//                                    ],
//                                    attributes: {class: "col-sm-5"}
//                                }
//                            ],
//                            attributes: {class: "form-group form-group-sm"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "label",
//                                    content: ["status:"],
//                                    attributes: {class: "col-sm-1 control-label"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "select",
//                                            content: [
//                                                {
//                                                    type: "option",
//                                                    content: ["draft"],
//                                                    attributes: {value: "draft"}
//                                                },
//                                                {
//                                                    type: "option",
//                                                    content: ["published"],
//                                                    attributes: {value: "published"}
//                                                },
//                                                {
//                                                    type: "option",
//                                                    content: ["sent_to_live"],
//                                                    attributes: {value: "sent_to_live"}
//                                                }
//                                            ],
//                                            attributes: {name: "status","do-after": "{el.value = t.status}",onchange: "{t.status = e.target.value}",class: "form-control"}
//                                        }
//                                    ],
//                                    attributes: {class: "col-sm-5"}
//                                }
//                            ],
//                            attributes: {class: "form-group form-group-sm"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "label",
//                                    content: ["summary:"],
//                                    attributes: {class: "col-sm-1 control-label"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "textarea",
//                                            content: ["{t.summary}"],
//                                            attributes: {placeholder: "summary",onchange: "{t.summary = e.target.value}",class: "form-control"}
//                                        }
//                                    ],
//                                    attributes: {class: "col-sm-5"}
//                                }
//                            ],
//                            attributes: {class: "form-group form-group-sm"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "label",
//                                    content: ["outage start"],
//                                    attributes: {class: "col-sm-1 control-label"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "input",
//                                            attributes: {value: "{t.outage_start}",placeholder: "outage start",onchange: "{t.outage_start = e.target.value}",do: "{ctl.datePicker(el)}",class: "form-control"}
//                                        }
//                                    ],
//                                    attributes: {class: "col-sm-5"}
//                                }
//                            ],
//                            attributes: {class: "form-group form-group-sm"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "label",
//                                    content: ["detected at: "],
//                                    attributes: {class: "col-sm-1 control-label"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "input",
//                                            attributes: {value: "{ t.detected_at }",placeholder: "Detected at",onchange: "{t.detected_at = e.target.value}",do: "{ctl.datePicker(el)}",class: "form-control"}
//                                        }
//                                    ],
//                                    attributes: {class: "col-sm-5"}
//                                }
//                            ],
//                            attributes: {class: "form-group form-group-sm"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "label",
//                                    content: ["resolved at: "],
//                                    attributes: {class: "col-sm-1 control-label"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "input",
//                                            attributes: {value: "{t.resolved_at}",placeholder: "Resolved at",onchange: "{t.resolved_at = e.target.value}",do: "{ctl.datePicker(el)}",class: "form-control"}
//                                        }
//                                    ],
//                                    attributes: {class: "col-sm-5"}
//                                }
//                            ],
//                            attributes: {class: "form-group form-group-sm"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "button",
//                                            content: ["Save"],
//                                            attributes: {class: "btn btn-primary",onclick: "{ctl.saveRfo()}"}
//                                        }
//                                    ],
//                                    attributes: {class: "col-sm-offset-1 col-sm-5"}
//                                }
//                            ],
//                            attributes: {class: "form-group form-group-sm"}
//                        }
//                    ],
//                    attributes: {class: "form-horizontal Edit",style: "display:none"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["Symptoms & Detection"]
//                        },
//                        {
//                            type: "span",
//                            content: ["How did the problem manifest? How was it detected?"],
//                            attributes: {id: "symptoms-detection-help",class: "help-block"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: ["{ $(marked(t.symptoms_detection)) }"]
//                                },
//                                {
//                                    type: "a",
//                                    content: ["Edit"],
//                                    attributes: {class: "Action",onclick: "{$(e.target).parent().next('.Edit').toggle()}"}
//                                }
//                            ]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "textarea",
//                                    content: ["{t.symptoms_detection}"],
//                                    attributes: {"aria-describedby": "symptoms-detection-help",rows: "10",onchange: "{t.symptoms_detection = e.target.value}",class: "form-control markdown"}
//                                },
//                                {
//                                    type: "button",
//                                    content: ["Save"],
//                                    attributes: {class: "btn btn-primary",onclick: "{ctl.saveRfo()}"}
//                                }
//                            ],
//                            attributes: {class: "Edit",style: "display:none"}
//                        }
//                    ],
//                    attributes: {id: "symptoms"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["Root Cause"]
//                        },
//                        {
//                            type: "span",
//                            content: ["How did the outage happen?"],
//                            attributes: {id: "root-cause-help",class: "help-block"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: ["{ $(marked(t.root_cause)) }"]
//                                },
//                                {
//                                    type: "a",
//                                    content: ["Edit"],
//                                    attributes: {class: "Action",onclick: "{$(e.target).parent().next('.Edit').toggle()}"}
//                                }
//                            ]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "textarea",
//                                    content: ["{t.root_cause}"],
//                                    attributes: {"aria-describedby": "root-cause-help",rows: "10",onchange: "{t.root_cause = e.target.value}",class: "form-control markdown"}
//                                },
//                                {
//                                    type: "button",
//                                    content: ["Save"],
//                                    attributes: {class: "btn btn-primary",onclick: "{ctl.saveRfo()}"}
//                                }
//                            ],
//                            attributes: {class: "Edit",style: "display:none"}
//                        }
//                    ],
//                    attributes: {id: "root-cause"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["Corrective Action"]
//                        },
//                        {
//                            type: "span",
//                            content: ["How was the outage resolved?"],
//                            attributes: {id: "corrective-action-help",class: "help-block"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "span",
//                                    content: ["{ $(marked(t.corrective_action)) }"]
//                                },
//                                {
//                                    type: "a",
//                                    content: ["Edit"],
//                                    attributes: {class: "Action",onclick: "{$(e.target).parent().next('.Edit').toggle()}"}
//                                }
//                            ]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "textarea",
//                                    content: ["\n                    {t.corrective_action}\n                "],
//                                    attributes: {"aria-describedby": "corrective-action-help",rows: "10",onchange: "{t.corrective_action = e.target.value}",class: "form-control markdown"}
//                                },
//                                {
//                                    type: "button",
//                                    content: ["Save"],
//                                    attributes: {class: "btn btn-primary",onclick: "{ctl.saveRfo()}"}
//                                }
//                            ],
//                            attributes: {class: "Edit",style: "display:none"}
//                        }
//                    ],
//                    attributes: {id: "corrective-action"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["How could we eliminate this class of outage?"]
//                        },
//                        {
//                            type: "span",
//                            content: ["Favor proactive (fix a tool, automate a process) over reactive (improve monitoring)."],
//                            attributes: {id: "solve-underlying-problem-help",class: "help-block"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: ["{ $(marked(t.solve_underlying_problem)) }"]
//                                },
//                                {
//                                    type: "a",
//                                    content: ["Edit"],
//                                    attributes: {class: "Action",onclick: "{$(e.target).parent().next('.Edit').toggle()}"}
//                                }
//                            ]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "textarea",
//                                    content: ["{t.solve_underlying_problem}"],
//                                    attributes: {"aria-describedby": "solve-underlying-problem-help",rows: "10",onchange: "{t.solve_underlying_problem = e.target.value}",class: "form-control markdown"}
//                                },
//                                {
//                                    type: "button",
//                                    content: ["Save"],
//                                    attributes: {class: "btn btn-primary",onclick: "{ctl.saveRfo()}"}
//                                }
//                            ],
//                            attributes: {class: "Edit",style: "display:none"}
//                        }
//                    ],
//                    attributes: {id: "solve-underlying-problem"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["How effective was the monitoring?"]
//                        },
//                        {
//                            type: "span",
//                            content: ["Was there an alert from a machine? Did the alert reach a human? Did the alert help identify the problem? Did the alert trigger thousands of times?"],
//                            attributes: {id: "monitoring-effectiveness",class: "help-block"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: ["{ $(marked(t.monitoring_effectiveness)) }"]
//                                },
//                                {
//                                    type: "a",
//                                    content: ["Edit"],
//                                    attributes: {class: "Action",onclick: "{$(e.target).parent().next('.Edit').toggle()}"}
//                                }
//                            ]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "textarea",
//                                    content: ["\n                    {t.monitoring_effectiveness}\n                "],
//                                    attributes: {"aria-describedby": "monitoring-effectiveness-help",rows: "10",onchange: "{t.monitoring_effectiveness = e.target.value}",class: "form-control"}
//                                },
//                                {
//                                    type: "button",
//                                    content: ["Save"],
//                                    attributes: {class: "btn btn-primary",onclick: "{ctl.saveRfo()}"}
//                                }
//                            ],
//                            attributes: {class: "Edit",style: "display:none"}
//                        }
//                    ],
//                    attributes: {id: "monitoring-effectiveness"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["Events"]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: ["{t.key}"]
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "div",
//                                            content: [
//                                                {
//                                                    type: "a",
//                                                    content: ["{ ctl.formatDate(t.timestamp, 'HH:mm') } - { t.description }"],
//                                                    attributes: {onclick: "{ctl.toggleEvent(e.target, t)}"}
//                                                },
//                                                {
//                                                    type: "span",
//                                                    content: ["{t.name}"],
//                                                    attributes: {each: "{ t.tags }",class: "label label-info"}
//                                                },
//                                                {
//                                                    type: "span",
//                                                    content: [
//                                                        {
//                                                            type: "span",
//                                                            content: ["{t.comments.length} comments"],
//                                                            attributes: {class: "label label-info"}
//                                                        }
//                                                    ],
//                                                    attributes: {if: "{ t.comments.length>0 }"}
//                                                },
//                                                {
//                                                    type: "span",
//                                                    content: [
//                                                        {
//                                                            type: "a",
//                                                            content: ["Edit"],
//                                                            attributes: {class: "Action",if: "{ctl.editable}",onclick: "{ctl.editEvent(t, e)}"}
//                                                        },
//                                                        {
//                                                            type: "a",
//                                                            content: ["Delete"],
//                                                            attributes: {class: "Action",if: "{ctl.editable}",onclick: "{ctl.deleteEvent(t)}"}
//                                                        }
//                                                    ],
//                                                    attributes: {class: "Actions"}
//                                                }
//                                            ]
//                                        },
//                                        {
//                                            type: "div",
//                                            content: [
//                                                {
//                                                    type: "div",
//                                                    content: [
//                                                        {
//                                                            type: "h4",
//                                                            content: ["Edit Event"]
//                                                        },
//                                                        {
//                                                            type: "div",
//                                                            content: [
//                                                                {
//                                                                    type: "div",
//                                                                    attributes: {"amp-tag": "eventedit"}
//                                                                }
//                                                            ],
//                                                            attributes: {onsave: "{ctl.editEventSave(e.t)}",oncancel: "{ctl.editEventCancel()}"}
//                                                        }
//                                                    ],
//                                                    attributes: {class: "EditPanel",if: "{ctl.editable && ctl.editableEventId==t.id}"}
//                                                },
//                                                {
//                                                    type: "div",
//                                                    content: [
//                                                        {
//                                                            type: "span",
//                                                            content: ["{t.created} - {t.text} (", {
//                                                                type: "author",
//                                                                attributes: {name: "{t.changed_by}"}
//                                                            }, ")"]
//                                                        },
//                                                        {
//                                                            type: "a",
//                                                            content: ["Edit"],
//                                                            attributes: {class: "Action",if: "{ctl.editable}",onclick: "{ctl.editEventComment(t, e)}"}
//                                                        },
//                                                        {
//                                                            type: "a",
//                                                            content: ["Delete"],
//                                                            attributes: {class: "Action",if: "{ctl.editable}",onclick: "{ctl.deleteEventComment(t)}"}
//                                                        },
//                                                        {
//                                                            type: "div",
//                                                            content: [
//                                                                {
//                                                                    type: "h4",
//                                                                    content: ["Edit Event Comment"]
//                                                                },
//                                                                {
//                                                                    type: "div",
//                                                                    content: [
//                                                                        {
//                                                                            type: "div",
//                                                                            attributes: {"amp-tag": "commentedit"}
//                                                                        }
//                                                                    ],
//                                                                    attributes: {onsave: "{ctl.editEventCommentSave(e.t)}",oncancel: "{ctl.editEventCommentCancel()}"}
//                                                                }
//                                                            ],
//                                                            attributes: {class: "EditPanel",if: "{ctl.editable && ctl.editableEventCommentId==t.id}"}
//                                                        }
//                                                    ],
//                                                    attributes: {each: "{ t.comments }",class: "Comment"}
//                                                },
//                                                {
//                                                    type: "div",
//                                                    content: [
//                                                        {
//                                                            type: "a",
//                                                            content: ["Comment"],
//                                                            attributes: {class: "Action",onclick: "{$(e.target).closest('.Event').find('.CommentEdit').toggle()}"}
//                                                        }
//                                                    ]
//                                                },
//                                                {
//                                                    type: "div",
//                                                    content: [
//                                                        {
//                                                            type: "div",
//                                                            content: [
//                                                                {
//                                                                    type: "div",
//                                                                    attributes: {"amp-tag": "commentedit"}
//                                                                }
//                                                            ],
//                                                            attributes: {do: "{t = null}"}
//                                                        }
//                                                    ],
//                                                    attributes: {class: "CommentEdit",style: "display:none;",onsave: "{ctl.addEventComment(t, e.t)}"}
//                                                }
//                                            ],
//                                            attributes: {class: "Details"}
//                                        }
//                                    ],
//                                    attributes: {each: "{ t }",class: "Event{t.isOpened?' Expanded':''}"}
//                                }
//                            ],
//                            attributes: {each: "{ t.eventsByDay }"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "a",
//                                            content: ["Add an Event"],
//                                            attributes: {class: "Action",onclick: "{$(e.target).closest('.AddEvent').find('.EventEdit').toggle()}"}
//                                        }
//                                    ]
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "div",
//                                            attributes: {"amp-tag": "eventedit"}
//                                        }
//                                    ],
//                                    attributes: {do: "{t=ctl.newEvent}",class: "EventEdit",style: "display:none"}
//                                }
//                            ],
//                            attributes: {if: "{ctl.editable}",class: "AddEvent",onsave: "{ctl.addEvent(e.t)}",oncancel: "{$(el).find('.EventEdit').hide()}",do: "{t = null}"}
//                        }
//                    ],
//                    attributes: {id: "timeline",class: "Events"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["Follow ups"]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "span",
//                                            content: ["{t.created} {t.title}"]
//                                        },
//                                        {
//                                            type: "a",
//                                            content: ["{t.jira_key}"],
//                                            attributes: {href: "https://jira.booking.com/jira/browse/{t.jira_key}",target: "_blank"}
//                                        },
//                                        {
//                                            type: "span",
//                                            content: ["{t.jira_status} (", {
//                                                type: "author",
//                                                attributes: {name: "{t.changed_by}"}
//                                            }, ")"]
//                                        },
//                                        {type: "#comment"}
//                                    ],
//                                    attributes: {each: "{ t.follow_ups }",class: "Followup"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "a",
//                                            content: ["Add a Followup"],
//                                            attributes: {class: "Action",onclick: "{$(e.target).next('.FollowupEdit').toggle()}"}
//                                        },
//                                        {
//                                            type: "div",
//                                            content: [
//                                                {
//                                                    type: "div",
//                                                    content: [
//                                                        {
//                                                            type: "div",
//                                                            attributes: {"amp-tag": "followupedit"}
//                                                        }
//                                                    ],
//                                                    attributes: {do: "{t=null}"}
//                                                }
//                                            ],
//                                            attributes: {if: "{ctl.editable}",onsave: "{ctl.addFollowup(e.t)}",oncancel: "{ctl.addFollowupCancel()}",class: "FollowupEdit",style: "display:none"}
//                                        }
//                                    ]
//                                }
//                            ]
//                        }
//                    ],
//                    attributes: {id: "follow-ups"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["Impacts"]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: ["\n                    {t.created}\n                    {t.description}\n                    {t.value}\n                    (", {
//                                        type: "author",
//                                        attributes: {name: "{t.changed_by}"}
//                                    }, ")\n                    {' '}\n                    ", {
//                                        type: "a",
//                                        content: ["{t.supporting_url}"],
//                                        attributes: {href: "{t.supporting_url}",target: "_blank"}
//                                    }, "\n                    ", {
//                                        type: "span",
//                                        content: ["{t.category}"],
//                                        attributes: {class: "label label-info"}
//                                    }, "\n                    ", {
//                                        type: "a",
//                                        content: ["Edit"],
//                                        attributes: {class: "Action",if: "{ctl.editable}",onclick: "{ctl.editImpact(t, e)}"}
//                                    }, "\n                    ", {
//                                        type: "a",
//                                        content: ["Delete"],
//                                        attributes: {class: "Action",if: "{ctl.editable}",onclick: "{ctl.deleteImpact(t)}"}
//                                    }, "\n                "]
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "h4",
//                                            content: ["Edit Impact"]
//                                        },
//                                        {
//                                            type: "div",
//                                            content: [
//                                                {
//                                                    type: "div",
//                                                    attributes: {"amp-tag": "impactedit"}
//                                                }
//                                            ],
//                                            attributes: {onsave: "{ctl.editImpactSave(e.t)}",oncancel: "{ctl.editImpactCancel()}"}
//                                        }
//                                    ],
//                                    attributes: {class: "EditPanel",if: "{ctl.editable && ctl.editableImpactId==t.id}"}
//                                }
//                            ],
//                            attributes: {each: "{ t.impacts }",class: "Impact"}
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "a",
//                                    content: ["Add an Impact"],
//                                    attributes: {class: "Action",onclick: "{$(e.target).next('.ImpactEdit').toggle()}"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "div",
//                                            content: [
//                                                {
//                                                    type: "div",
//                                                    attributes: {"amp-tag": "impactedit"}
//                                                }
//                                            ],
//                                            attributes: {do: "{t=null}"}
//                                        }
//                                    ],
//                                    attributes: {if: "{ctl.editable}",onsave: "{ctl.addImpact(e.t)}",oncancel: "{$(e.currentTarget).toggle()}",class: "ImpactEdit",style: "display:none"}
//                                }
//                            ]
//                        }
//                    ],
//                    attributes: {id: "impacts"}
//                },
//                {type: "hr"},
//                {
//                    type: "div",
//                    content: [
//                        {
//                            type: "h3",
//                            content: ["Comments"]
//                        },
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "span",
//                                    content: ["{t.created} - {t.text} (", {
//                                        type: "author",
//                                        attributes: {name: "{t.changed_by}"}
//                                    }, ")"]
//                                },
//                                {
//                                    type: "a",
//                                    content: ["Edit"],
//                                    attributes: {class: "Action",if: "{ctl.editable}",onclick: "{ctl.editComment(t, e)}"}
//                                },
//                                {
//                                    type: "a",
//                                    content: ["Delete"],
//                                    attributes: {class: "Action",if: "{ctl.editable}",onclick: "{ctl.deleteComment(t)}"}
//                                },
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "h4",
//                                            content: ["Edit Comment"]
//                                        },
//                                        {
//                                            type: "div",
//                                            content: [
//                                                {
//                                                    type: "div",
//                                                    attributes: {"amp-tag": "commentedit"}
//                                                }
//                                            ],
//                                            attributes: {onsave: "{ctl.editCommentSave(e.t)}",oncancel: "{ctl.editCommentCancel()}"}
//                                        }
//                                    ],
//                                    attributes: {class: "EditPanel",if: "{ctl.editable && ctl.editableCommentId==t.id}"}
//                                }
//                            ],
//                            attributes: {each: "{ t.comments }",class: "Comments"}
//                        },
//                        {type: "#comment"},
//                        {
//                            type: "div",
//                            content: [
//                                {
//                                    type: "div",
//                                    content: [
//                                        {
//                                            type: "div",
//                                            attributes: {"amp-tag": "commentadd"}
//                                        }
//                                    ],
//                                    attributes: {do: "{t=null}"}
//                                }
//                            ],
//                            attributes: {if: "{ctl.editable}",onsave: "{ctl.addComment(e.t)}",oncancel: "{$(el).toggle()}",class: "CommentEdit"}
//                        }
//                    ],
//                    attributes: {id: "comments"}
//                },
//                {type: "hr"}
//            ],
//            attributes: {class: "container-fluid"}
//        }
//    ],
//    attributes: {class: "Rfo"}
//};