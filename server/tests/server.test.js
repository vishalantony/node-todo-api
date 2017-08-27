const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');

// models
const { Todo } = require('../models/todo');
const { User } = require('../models/user');

beforeEach((done) => {
  Todo.remove({}).then(() => done()); //will move to test case only when done is called
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
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
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
          expect(todos.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
