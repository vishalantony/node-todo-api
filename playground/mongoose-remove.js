const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

// multiple remove
// Todo.remove({}).then((results) => {
//   console.log(results);
// });

// Todo.findOneAndRemove({})
// Todo.findByIdAndRemove

// Todo.findOneAndRemove({_id: '59a7038db0ac281e81edaa60'}).then((todo) => {
//   console.log(JSON.stringify(todo, undefined, 2));
// });

Todo.findByIdAndRemove('59a6ff8eb0ac281e81edaa11').then((todo) => {
  console.log(JSON.stringify(todo, undefined, 2));
}, (err) => {
  console.log(err);
});
