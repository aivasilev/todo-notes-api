const fetchTodos = (req, res, db) => {
  if (!req.query.id) {
    return res.status(400).json({ code: 1, message: 'wrong parameters' });
  }
  db.all(
    'SELECT todo_id, done, text FROM todos WHERE users_unumber=?',
    req.query.id,
    (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        res.json({ code: 0, payload: rows });
      }
    }
  );
};
const fetchTodosCount = (req, res, db) => {
  if (!req.query.id) {
    return res.status(400).json({ code: 1, message: 'wrong parameters' });
  }
  db.get(
    'SELECT COUNT(*) AS total FROM todos WHERE users_unumber=? AND done=FALSE',
    req.query.id,
    (err, row) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        res.json({ code: 0, payload: row });
      }
    }
  );
};

const updateTodo = (req, res, db, crypto) => {
  // check for correct request params
  if (!req.body.todo_id || !req.body.text || !req.body.uid) {
    return res.status(400).json({ code: 1, message: 'wrong parameters' });
  }
  const { todo_id, done, text, uid } = req.body;
  // create new note
  if (req.body.todo_id === 'new') {
    // generate unique id
    const todoId = crypto.randomBytes(20).toString('hex');
    db.run(
      'INSERT INTO todos(todo_id, done, text, users_unumber) VALUES(?, ?, ?, ?)',
      todoId,
      done,
      text,
      uid,
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        res.json({ code: 0, message: 'success' });
      }
    );
    return;
  }
  // update existing note
  db.get('SELECT * FROM todos WHERE todo_id=? AND users_unumber=?', todo_id, uid, (err, row) => {
    if (err) {
      return res.status(500);
    }
    if (!row) {
      return res.json({ code: 1, message: 'no such taks' });
    }
    db.run('UPDATE todos SET done=?, text=? WHERE todo_id=?', done, text, todo_id, (err) => {
      if (err) {
        console.log(err);
        return res.status(500);
      }
      res.json({ code: 0, message: 'success' });
    });
  });
};

const deleteTodo = (req, res, db) => {
  const { todo_id, uid } = req.body;
  db.run('DELETE FROM todos WHERE todo_id=? AND users_unumber=?', todo_id, uid, (err) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    res.json({ code: 0, message: 'success' });
  });
};

module.exports = {
  fetchTodos,
  updateTodo,
  deleteTodo,
  fetchTodosCount,
};
