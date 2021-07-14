const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({error: 'Mensagem de erro'})
  }

  request.user = user;
  next();
}

app.post('/users', (request, response) => {

  const { name, username, todos = [] } = request.body;

  const id = uuidv4();

  let user = users.find(user => user.username === username);

  if(user){
    return response.status(400).json({error: 'Mensagem de erro'})
  }

  user = {
    id: id,
    name,
    username,
    todos
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  const checkUser = users.find(item => item.username === user.username);

  return response.status(200).json(checkUser.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline, done = false } = request.body;

  const todoId = uuidv4();
  const created_at = new Date();

  const newTodo = {
    id: todoId,
    title,
    deadline: new Date(deadline),
    done,
    created_at
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const todoId = request.params.id;

  const todoToUpdate = user.todos.find(todo => todo.id === todoId);

  if(!todoToUpdate){
    return response.status(404).json({ error: 'Mensagem de erro' });
  }

  todoToUpdate.title = title;
  todoToUpdate.deadline = new Date(deadline);

  return response.status(200).json(todoToUpdate);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const todoId = request.params.id;

  const todoToUpdate = user.todos.find(todo => todo.id === todoId );

  if(!todoToUpdate){
    return response.status(404).json({ error: 'Mensagem de erro' });
  }

  todoToUpdate.done = true;

  return response.status(200).json(todoToUpdate);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const user = request.user;
  const todoId = request.params.id;

  const checkTodoToDelete = user.todos.findIndex(todo => todo.id === todoId);

  if(checkTodoToDelete === -1){
    return response.status(404).json({ error: 'Mensagem de erro' });
  }

  user.todos.splice(checkTodoToDelete, 1);

  return response.status(204).json();
});

module.exports = app;