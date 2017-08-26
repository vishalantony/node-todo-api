const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) {
    return console.log('Unable to connect to the DB', err);
  }
  console.log('Connected to MongoDB server');
  db.collection('Todos').insertOne({
    text: 'Something to do again and again and again',
    completed: false
  }, (err, res) => {
    if(err) {
      return console.log('Unable to insert Todo to the DB', err);
    }
    console.log(JSON.stringify(res.ops, undefined, 2));
  });

  db.collection('Users').insertOne({
    name: 'Mario Sukamoto',
    age: 29,
    location: 'Tokyo'
  }, (err, res) => {
    if(err) {
      console.log('Unable to insert user', res);
    }
    console.log(res.ops[0]._id.getTimestamp());
  });
  //
  db.close();
});
