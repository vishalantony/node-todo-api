const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

// var id = '59a30573253c3d3e61b28a94';
//
// if(!ObjectID.isValid(id)) {
//   return console.log('Invalid ID', id);
// }
//
// Todo.find({ _id: id }).then((todos) => {
//   if(todos.length == 0) {
//     return console.log('No record with given ID');
//   }
//   console.log('Todos', todos);
// });
//
// Todo.findOne({ _id: id }).then((todo) => {
//   if(!todo) {
//     return console.log('No record with given ID');
//   }
//   console.log('Todo ', todo);
// });
//
// Todo.findById(id).then((todo) => {
//   if(!todo) {
//     return console.log('No record with given ID');
//   }
//   console.log('Todo by ID', todo);
// }).catch((e) => console.log(e));


var userID = '59a26c6ae7aa265d4e1206c41';
User.findById(userID).then((user) => {
  if(!user) {
    return console.log('User not found');
  }
  console.log('User found: ', user);
}).catch((e) => console.log(e));
