function main() {
    load();
}

function save() {
    var lists = $(document).databindback().data("source");
    localStorage["TodoLists"] = JSON.stringify(lists);
}

function load() {
    var lists = JSON.parse(localStorage["TodoLists"] || null) || [];
    $(document).data("source", lists).databind();
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
    $(document).data('source').push(list);
    $(document).databind();
    //selectList()
}

function input_onfocus(e) {
    window.setTimeout(e.target.select.bind(e.target), 0);
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
    $('.TodoItem.Selected').removeClass('Selected'); $(el).addClass('Selected');
}

function selectList(el) {
    $('.TodoList.Selected').removeClass('Selected'); $(el).addClass('Selected');
}