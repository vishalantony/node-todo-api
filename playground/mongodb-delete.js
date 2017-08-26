const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) {
    return console.log('Unable to connect to the DB', err);
  }
  console.log('Connected to MongoDB server');

  db.collection('Todos').deleteMany({text: 'Something to do'}).then((result) => {
    console.log(result);
  });

  db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
    console.log(result);
  });

  db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
    console.log(result);
  });

  db.collection('Users').deleteMany({location: 'Tokyo'}).then((results) => {
    console.log(results);
  });

  db.collection('Users').findOneAndDelete({age: 22}).then((results) => {
    console.log(results);
  });

  // db.close();
});
