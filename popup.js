      var chlist = {};
      chlist.webdb = {};
      chlist.webdb.db = null;
      
      chlist.webdb.open = function() {
        var dbSize = 5 * 1024 * 1024; // 5MB
        chlist.webdb.db = openDatabase("Todo", "1.0", "Todo manager", dbSize);
      }
      
      chlist.webdb.createTable = function() {
        var db = chlist.webdb.db;
        db.transaction(function(tx) {
          tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on DATETIME)", []);
        });
      }
      
      chlist.webdb.addTodo = function(todoText) {
        var db = chlist.webdb.db;
        db.transaction(function(tx){
          var addedOn = new Date();
          tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)",
              [todoText, addedOn],
              chlist.webdb.onSuccess,
              chlist.webdb.onError);
         });
      }
      
      chlist.webdb.onError = function(tx, e) {
        alert("There has been an error: " + e.message);
      }
      
      chlist.webdb.onSuccess = function(tx, r) {
        // re-render the data.
        chlist.webdb.getAllTodoItems(loadTodoItems);
      }
      
      
      chlist.webdb.getAllTodoItems = function(renderFunc) {
        var db = chlist.webdb.db;
        db.transaction(function(tx) {
          tx.executeSql("SELECT * FROM todo", [], renderFunc,
              chlist.webdb.onError);
        });
      }
      
      chlist.webdb.deleteTodo = function(id) {
        var db = chlist.webdb.db;
        db.transaction(function(tx){
          tx.executeSql("DELETE FROM todo WHERE ID=?", [id],
              chlist.webdb.onSuccess,
              chlist.webdb.onError);
          });
      }
      
      function loadTodoItems(tx, rs) {
        var rowOutput = "";
        var todoItems = document.getElementById("todoItems");
        for (var i=0; i < rs.rows.length; i++) {
          rowOutput += renderTodo(rs.rows.item(i));
        }
      
        todoItems.innerHTML = rowOutput;
      }
      
      function renderTodo(row) {
        return "<li>" + row.todo  + " [<a href='javascript:void(0);'  onclick='chlist.webdb.deleteTodo(" + row.ID +");'>Delete</a>]</li>";
      }
      
      function init() {
        chlist.webdb.open();
        chlist.webdb.createTable();
        chlist.webdb.getAllTodoItems(loadTodoItems);
      }
      
      function addTodo() {
        var todo = document.getElementById("todo");
        chlist.webdb.addTodo(todo.value);
        todo.value = "";
      }