function main() {
    load();
}

function save() {
    var lists = $(document).databindback().datasource();
    localStorage["TodoLists"] = JSON.stringify(lists);
}

function load() {
    var lists = JSON.parse(localStorage["TodoLists"] || null) || [];
    $(document).datasource(lists).databind();
}

function newTask() {
    var divList = $(".TodoList.Selected:not(.Template)").first();
    if (divList.length == 0)
        divList = $(".TodoList:not(.Template)").first();
    if (divList.length == 0) {
        newList();
        divList = $(".TodoList:not(.Template)").first();
    }
    divList.datasource().items.push({ title: 'Task', done: false });
    divList.databind();
}

function deleteList(el) {
    var divList = $(el).closest('.TodoList');
    var list = divList.data('source');
    var lists = $(document).data('source');
    lists.remove(list);
    $(document).databind();
}

function newList() {
    var list = { name: 'List', items: [] };
    $(document).datasource().push(list);
    $(document).databind();
    selectList($(".TodoList:not(.Template)").wheredatasource(list)[0]);
}

function deleteTask(el) {
    var divList = $(el).closest('.TodoList');
    var task = $(el).datasource();
    var list = divList.data('source');
    list.items.remove(task);
    divList.databind();
}

function deleteSelectedTask() {
    $(".TodoItem.Selected").toArray().forEach(deleteTask);
}

function deleteSelectedList() {
    $(".TodoList.Selected").toArray().forEach(deleteList);
}

function selectTask(el) {
    $('.TodoItem.Selected').removeClass('Selected');
    $(el).addClass('Selected');
}

function selectList(el) {
    $('.TodoList.Selected').removeClass('Selected');
    $(el).addClass('Selected');
}

function DoneCount_onbind(e) {
    var el = $(e.target);
    var tl = el.datasource();
    el.text(tl.items.where('t=>t.done'.toLambda()).length + ' out of ' + tl.items.length);
}

var scheduleSaveTimer = new Timer(scheduleSave);
function scheduleSave() {
    scheduleSaveTimer.set(0);
}