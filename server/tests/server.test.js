const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');

// models
const { Todo } = require('../models/todo');
const { User } = require('../models/user');

const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Testing todo';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.find({ _creator: users[0]._id }).then((todos) => {
          expect(todos.length).toBe(3);
          expect(todos[todos.length-1].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo without authentication', (done) => {
    request(app)
      .post('/todos')
      .send({
        text: 'sample text'
      })
      .expect(401)
      .end(done);
  })

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(3);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos belonging to user', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err) {
          done(err);
        }
        Todo.find({ _creator: users[0]._id }).then((todos) => {
          expect(res.body.count).toBe(todos.length);
          expect(res.body.todos.length).toBe(todos.length);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not get todos without authentication', (done) => {
    request(app)
      .get('/todos')
      .expect(401)
      .end(done);
  });
});


describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
        expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
      })
      .end(done);
  });

  it('should return 404 for todo not found', (done) => {
    request(app)
      .get(`/todos/${(new ObjectID()).toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404, done);
  });

  it('should return 404 for non ObjectIDs', (done) => {
    request(app)
      .get(`/todos/${parseInt(Math.random() * 10000000)}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404, done);
  });

  it('should not return a todo doc when accessing other user\'s todo', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404, done);
  });

  it('should return 401 when not authenticated', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(401, done);
  });
});


describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexID = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.findOne({
          _id: hexID,
          _creator: users[0]._id
        }).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if not found', (done) => {
    var hexID = (new ObjectID()).toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if user does not own the todo', (done) => {
    var hexID = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 401 if user not authentcated', (done) => {
    var hexID = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .expect(401)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    var hexID = 'fgjebdhwh8723uyhjwfv87tueyghjkuydrfchgvbjkity';
    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});


describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var id = todos[0]._id.toHexString();
    var newText = 'Updated text';
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({text: newText, completed: true})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end((err, res) => {
        if(err) {
          done(err)
        }
        Todo.findOne({ _id: id, _creator: users[0]._id }).then((todo) => {
          expect(todo.text).toBe(newText);
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          done();
        }).catch((err) => done(err));
      });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var id = todos[0]._id.toHexString();
    var newText = 'Updated text';
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({text: newText, completed: false})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end((err, res) => {
        if(err) {
          done(err)
        }
        Todo.findOne({ _id: id, _creator: users[0]._id }).then((todo) => {
          expect(todo.text).toBe(newText);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toNotExist();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 401 if user not authenticated', (done) => {
    var id = todos[1]._id.toHexString();
    var newText = 'Updated text';
    request(app)
      .patch(`/todos/${id}`)
      .send({text: newText, completed: false})
      .expect(401)
      .end(done);
  });

  it('should not let user update todo not belonging to him', (done) => {
    var id = todos[1]._id.toHexString();
    var newText = 'Updated text';
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({text: newText, completed: false})
      .expect(404)
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => expect(res.body).toEqual({error: 'Invalid user credentials'}))
      .end(done);
  });
});


describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = 'abcdefg';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if(err) {
          return done(err);
        }
        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request is invalid', (done) => {
    request(app)
      .post('/users')
      .send({email: 'invEmail', password: 'abc'})
      .expect(400)
      .end(done);
  });

  it('it should not create user if email is already in use', (done) => {
    request(app)
      .post('/users')
      .send({email: users[0].email, password: 'password123'})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: users[1].password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: `${users[1].password}sampletext`})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
