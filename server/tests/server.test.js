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
  it('1. should create a new todo', (done) => {
    var text = 'Testing todo';
    request(app)
      .post('/todos')
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
        Todo.find().then((todos) => {
          expect(todos.length).toBe(6);
          expect(todos[todos.length-1].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('2. should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(5);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('3. should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .end((err, res) => {
        if(err) {
          done(err);
        }
        Todo.find().then((todos) => {
          expect(res.body.count).toBe(todos.length);
          expect(res.body.todos.length).toBe(todos.length);
          done();
        }).catch((e) => done(e));
      });
  });
});


describe('GET /todos/:id', () => {
  it('4. should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
        expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
      })
      .end(done);
  });

  it('5.should return 404 for todo not found', (done) => {
    request(app)
      .get(`/todos/${(new ObjectID()).toHexString()}`)
      .expect(404, done);
  });

  it('6.should return 404 for non ObjectIDs', (done) => {
    request(app)
      .get(`/todos/${parseInt(Math.random() * 10000000)}`)
      .expect(404, done);
  })
});


describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexID = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.findById(hexID).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if not found', (done) => {
    var hexID = (new ObjectID()).toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    var hexID = 'fgjebdhwh8723uyhjwfv87tueyghjkuydrfchgvbjkity';
    request(app)
      .delete(`/todos/${hexID}`)
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
        Todo.findById(id).then((todo) => {
          expect(todo.text).toBe(newText);
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          done();
        }).catch((err) => done(err));
      });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var id = todos[1]._id.toHexString();
    var newText = 'Updated text';
    request(app)
      .patch(`/todos/${id}`)
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
        Todo.findById(id).then((todo) => {
          expect(todo.text).toBe(newText);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toNotExist();
          done();
        }).catch((err) => done(err));
      });
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
        });
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
