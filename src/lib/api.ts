import { PostTodo, Todo } from './types';

const BASE_URL = 'https://simple-todo-api.kyrregjerstad.workers.dev';

export const getTodos = async (userId: number): Promise<Todo[]> => {
  const res = await fetch(`${BASE_URL}/users/${userId}/todos`);
  const data = await res.json();

  return data;
};

export const postTodo = async (userId: number, todo: PostTodo) => {
  const response = await fetch(`${BASE_URL}/users/${userId}/todos`, {
    method: 'POST',
    body: JSON.stringify(todo),
  });
  return await response.json();
};

export const completeTodo = async (todoId: number) => {
  const response = await fetch(`${BASE_URL}/todos/${todoId}/complete`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return true;
};

export const deleteTodo = async (todoId: number) => {
  const response = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return true;
};
