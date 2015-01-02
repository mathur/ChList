window.addEventListener("load", init);

window.onload = function() {
    var form = document.getElementById('todoform');
    form.onsubmit = function() {
        addTodo();
        return false;
    }
}

var chlist = {};
chlist.indexedDB = {};
      
chlist.indexedDB.db = null;

chlist.indexedDB.open = function() {
  var version = 1;
  var request = indexedDB.open("todos", version);

  request.onupgradeneeded = function(e) {
    var db = e.target.result;

    e.target.transaction.onerror = chlist.indexedDB.onerror;

    if(db.objectStoreNames.contains("todo")) {
      db.deleteObjectStore("todo");
    }

    var store = db.createObjectStore("todo",
      {keyPath: "timeStamp"});
  };

  request.onsuccess = function(e) {
    chlist.indexedDB.db = e.target.result;
    chlist.indexedDB.getAllTodoItems();
  };

  request.onerror = chlist.indexedDB.onerror;
};

chlist.indexedDB.addTodo = function(todoText) {
  var db = chlist.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");
  var request = store.put({
    "text": todoText,
    "timeStamp" : new Date().getTime()
  });

  trans.oncomplete = function(e) {
    chlist.indexedDB.getAllTodoItems();
  };

  request.onerror = function(e) {
    console.log(e.value);
  };
};
      
chlist.indexedDB.getAllTodoItems = function() {
  var todos = document.getElementById("todoItems");
  todos.innerHTML = "";

  var db = chlist.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;

    renderTodo(result.value);
    result.continue();
  };

  cursorRequest.onerror = chlist.indexedDB.onerror;
};
      
chlist.indexedDB.deleteTodo = function(id) {
  var db = chlist.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  var request = store.delete(id);

  trans.oncomplete = function(e) {
    chlist.indexedDB.getAllTodoItems();
  };

  request.onerror = function(e) {
    console.log(e);
  };
};
      
function renderTodo(row) {
  var todos = document.getElementById("todoItems");
  var li = document.createElement("li");
  var a = document.createElement("a");
  var t = document.createTextNode("");
  t.data = row.text;

  a.addEventListener("click", function(e) {
    chlist.indexedDB.deleteTodo(row.text);
  });

  a.textContent = " [Delete]";
  li.appendChild(t);
  li.appendChild(a);
  todos.appendChild(li);
}

function init() {
  chlist.indexedDB.open();
}

window.addEventListener("DOMContentLoaded", init, false);
      
function addTodo() {
  var todo = document.getElementById('todo');

  chlist.indexedDB.addTodo(todo.value);
  todo.value = '';
}