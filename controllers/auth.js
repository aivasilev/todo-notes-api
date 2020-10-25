const crypto = require('crypto');
const handleLogin = (req, res, db, bcrypt) => {
  // Check that fields are correct
  if (req.body.login == 0 || req.body.pass == 0) {
    res.status(400).json({ code: 1, message: 'empty fields not allowed' });
  } else {
    db.get('SELECT * FROM users WHERE username=?', req.body.login, (err, row) => {
      if (err) {
        console.log(err);
        return res.json.code(500).json({ code: 1 });
      }
      if (!row) {
        return res.json({ code: 1, message: 'wrong username or password' });
      }
      const { unumber } = row;
      db.get('SELECT hash FROM authentication WHERE users_unumber=?', unumber, (err, row) => {
        if (err) {
          console.log(err);
          res.json.code(500).json({ code: 1 });
        } else {
          const { hash } = row;
          bcrypt.compare(req.body.pass, hash).then((match) => {
            if (match) {
              res.json({ code: 0, id: unumber });
            } else {
              res.json({ code: 1, message: 'wrong username or password' });
            }
          });
        }
      });
    });
  }
};

const handleRegister = (req, res, db, bcrypt, saltRounds) => {
  // Check that request does not have empty fields
  if (req.body.login == 0 || req.body.pass == 0) {
    // If login or pass are empty, send error response
    return res.status(400).json({ code: 1, message: 'empty fields not allowed' });
  }
  // Query the database
  db.get('SELECT * FROM users WHERE username=?', req.body.login, (err, row) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ code: 1 });
    }
    if (row) {
      return res.json({ code: 1, message: 'unable to register' });
    }
    db.serialize(() => {
      const unumber = crypto.randomBytes(20).toString('hex');
      db.run('INSERT INTO users(unumber, username) VALUES(?, ?)', unumber, req.body.login, (err) =>
        err ? console.log(err) : null
      );
      bcrypt.hash(req.body.pass, saltRounds, (err, hash) => {
        db.run(
          'INSERT INTO authentication(users_unumber, hash) VALUES(?, ?)',
          unumber,
          hash,
          (err) => {
            if (err) {
              console.log(err);
              return res.json({ code: 1 });
            }
            res.json({ code: 0, message: 'success' });
          }
        );
      });
    });
  });
};

module.exports = {
  handleLogin,
  handleRegister,
};
