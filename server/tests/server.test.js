const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');

// models
const { Todo } = require('../models/todo');
const { User } = require('../models/user');

const todos = [
  { text: 'first test todo' },
  { text: 'first test todo' },
  { text: 'first test todo' },
  { text: 'first test todo' },
  { text: 'first test todo' }
];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done()); //will move to test case only when done is called
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
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

  it('should not create todo with invalid body data', (done) => {
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
  it('should get all todos', (done) => {
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
