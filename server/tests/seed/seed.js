const { ObjectID } = require('mongodb');
const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const users = [{
  _id: userOneID,
  email: 'vishal@example.com',
  password: 'user1password',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneID.toHexString(), access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoID,
  email: 'antony@example.com',
  password: 'user2password',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoID.toHexString(), access: 'auth'}, 'abc123').toString()
  }]
}];

const todos = [
  { _id: new ObjectID(), text: 'first test todo', _creator: userOneID },
  { _id: new ObjectID(), text: 'second test todo', completed: true, completedAt: 333, _creator: userTwoID },
  { _id: new ObjectID(), text: 'third test todo', _creator: userOneID }
];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done()); //will move to test case only when done is called
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo])
  }).then(() => done());
}

module.exports = {
  todos, populateTodos,
  users, populateUsers
}
