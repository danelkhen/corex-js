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

function newTask(el) {
    var divList = $(el).closest('.TodoList');
    divList.data('source').items.push({ title: 'Task', done: false });
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
    $(document).data('source').push({ name: 'List', items: [] });
    $(document).databind();
}