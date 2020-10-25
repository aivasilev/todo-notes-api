const sqlite3 = require('sqlite3');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const auth = require('./controllers/auth.js');
const notes = require('./controllers/notes.js');
const todos = require('./controllers/todos.js');
const PORT = process.env.PORT || 80;

const app = express();
// Open database
const db = new sqlite3.Database('./todo-notes.db');

// Middleware
app.use(express.json());
app.use(cors());

// Endpoints
app.post('/login', (req, res) => auth.handleLogin(req, res, db, bcrypt));
app.post('/register', (req, res) => auth.handleRegister(req, res, db, bcrypt, saltRounds));

app.get('/notes', (req, res) => notes.fetchNotes(req, res, db));
app.post('/notes', (req, res) => notes.updateNote(req, res, db, crypto));
app.delete('/notes', (req, res) => notes.deleteNote(req, res, db));

app.get('/todos', (req, res) => todos.fetchTodos(req, res, db));
app.post('/todos', (req, res) => todos.updateTodo(req, res, db, crypto));
app.delete('/todos', (req, res) => todos.deleteTodo(req, res, db));
app.get('/todos/count', (req, res) => todos.fetchTodosCount(req, res, db));

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
