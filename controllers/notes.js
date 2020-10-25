const fetchNotes = (req, res, db) => {
  if (!req.query.id) {
    return res.status(400).json({ code: 1, message: 'wrong query parameters' });
  }
  db.all(
    'SELECT note_id, title, text FROM notes WHERE users_unumber=?',
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

const updateNote = (req, res, db, crypto) => {
  // check for correct request params
  if (!req.body.note_id || !req.body.title || !req.body.uid) {
    return res.status(400).json({ code: 1, message: 'wrong params' });
  }
  const { note_id, title, text, uid } = req.body;
  // create new note
  if (req.body.note_id === 'new') {
    // generate unique id
    const noteId = crypto.randomBytes(20).toString('hex');
    db.run(
      'INSERT INTO notes(note_id, title, text, users_unumber) VALUES(?, ?, ?, ?)',
      noteId,
      title,
      text,
      uid,
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        res.json({ code: 0, note_id: noteId });
      }
    );
    return;
  }
  // update existing note
  db.get('SELECT * FROM notes WHERE note_id=? AND users_unumber=?', note_id, uid, (err, row) => {
    if (err) {
      return res.status(500);
    }
    if (!row) {
      return res.json({ code: 1, message: 'no such note' });
    }
    db.run(
      'UPDATE notes SET title=?, text=?, modified=CURRENT_TIMESTAMP WHERE note_id=?',
      title,
      text,
      note_id,
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500);
        }
        res.json({ code: 0, message: 'success' });
      }
    );
  });
};

const deleteNote = (req, res, db) => {
  const { note_id, uid } = req.body;
  db.run('DELETE FROM notes WHERE note_id=? AND users_unumber=?', note_id, uid, (err) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    res.json({ code: 0, message: 'success' });
  });
};

module.exports = {
  fetchNotes,
  updateNote,
  deleteNote,
};
