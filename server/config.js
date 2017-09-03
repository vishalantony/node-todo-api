const env = process.env.NODE_ENV;

const database = {
  development: 'mongodb://localhost:27017/TodoApp',
  test: 'mongodb://localhost:27017/TestTodoApp'
};

const port = {
  development: 3000,
  test: 3000
}

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI || database[env] || 'mongodb://localhost:27017/TodoApp',
    PORT: process.env.PORT || port[env] || 3000
};
