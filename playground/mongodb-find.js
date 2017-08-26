const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) {
    return console.log('Unable to connect to the DB', err);
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').find({
  //   _id: new ObjectID('59a0418be414fb99d53b0c0b')
  // }).toArray().then((docs) => {
  //   console.log('Todos:');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to fetch Todo', err);
  // });

  // db.collection('Todos').find().count().then((count) => {
  //   console.log('Todos:');
  //   console.log('Todos count: ', count);
  // }, (err) => {
  //   console.log('Unable to fetch Todo', err);
  // });

  db.collection('Users').find({name: 'Vishal Antony'}).toArray().then((docs) => {
    console.log('Users');
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err) => {
    console.log('Unable to fetch users', err);
  });

  // db.close();
});
