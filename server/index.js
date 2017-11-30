const express = require("express"),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  port = 3001,
  app = express(),
  config = require("./config"),
  session = require("express-session"),
  massive = require("massive");
//        require('dotenv').config()

massive(config.connection_string)
  .then(dbInstance => {
    const table = dbInstance.tables.find(c => c.name == "todos");
    if (!table) {
      dbInstance
        .run(
          `create table todos (
        id serial primary key,
        todo varchar(40)
      )`
        )
        .then(console.log);
    }
    app.set("db", dbInstance);
  })
  .catch(console.log);

app.use(session(config.session));
app.use(cors());
app.use(bodyParser.json());
app.use("/", express.static(__dirname));

app.get("/api/todos", (req, res) => {
  const db = req.app.get("db");
  db
    .get_todos()
    .then(todos => {
      return res.send(todos);
    })
    .catch(console.log);
});
app.post("/api/todos", (req, res) => {
  const db = req.app.get("db");
  console.log(req.body.todo);
  db
    .post_todos(req.body.todo)
    .then(todos => {
      return res.send(todos);
    })
    .catch(console.log);
});
app.delete("/api/todos/:id", (req, res) => {
  const db = req.app.get("db");
  db
    .remove_todo(req.params.id)
    .then(todos => {
      return res.send(todos);
    })
    .catch(console.log);
});

app.listen(port, function() {
  console.log("Server listening on port", port);
});
