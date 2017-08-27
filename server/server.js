const express = require('express');
const bodyParser = require('body-parser');

const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User }  = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((data) => {
    //console.log('Success: ', data);
    res.send(data);
  }, (error) => {
    // console.log('Error: ', error);
    res.status(400).send(error);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos,
      count: todos.length
    });
  }, (err) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) {
    res.status(404).send({}); // can use return res.status(404).send({})
  } else {
    Todo.findById(id).then((todo) => {
      if(todo) {
        res.send({ todo });
      } else {
        res.status(404).send({});
      }
    }).catch((e) => {
      res.status(400).send({});
    });
  }
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});


module.exports = {
  app
};
