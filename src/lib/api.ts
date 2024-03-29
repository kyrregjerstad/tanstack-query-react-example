import { PostTodo, Todo } from './types';

const BASE_URL = 'https://todo.api.kyrre.dev';

export const getTodos = async (
  userId: number,
  isCompleted?: boolean | undefined,
): Promise<Todo[]> => {
  const res = await fetch(
    `${BASE_URL}/users/${userId}/todos?completed=${isCompleted}`,
  );
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

export const updateTodo = async (todoId: number, todo: PostTodo) => {
  const response = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: 'PATCH',
    body: JSON.stringify(todo),
  });
  return await response.json();
};
