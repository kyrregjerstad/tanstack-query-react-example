import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useState } from 'react';
import { deleteTodo, getTodos, postTodo, updateTodo } from './lib/api';
import { Todo } from './lib/types';
import { cn } from './lib/utils';

// gets a random user id between 1 and 999
// if you want to use a specific user id, you can replace this with a constant
// e.g const randomUserId = 500;
// all todos are stored in the a database, but deleted after 24 hours
const randomUserId = Math.floor(Math.random() * 999) + 1;

export const Todos = () => {
  // Destructuring the response from `useQuery` to obtain data, loading state, and error
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'], // Unique key for the query cache
    queryFn: () => getTodos(randomUserId), // Function to fetch todos
  });

  // Utilizing `useMutationState` to track the state of addTodo mutations
  const variables = useMutationState<string>({
    filters: { mutationKey: ['addTodo'], status: 'pending' }, // Filter for pending addTodo mutations
    select: (mutation) => mutation.state.variables as string, // Selecting the mutation variables (todo names)
  });

  // Render a loading state while the todos are being fetched
  if (isLoading) {
    return (
      <ul className="flex w-full flex-col gap-4">
        <TodoItem
          todo={{
            name: 'loading...',
            id: -1,
            completed: false,
            createdAt: new Date(),
          }}
        />
      </ul>
    );
  }

  // Displaying an error message if the fetch operation fails
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Rendering the list of todos along with pending todos from mutations
  return (
    <div className="w-full">
      <ul className="flex w-full flex-col gap-4">
        {variables.map((_, index) => (
          <div className="opacity-50">
            <TodoItem
              key={index}
              todo={{
                name: 'loading...',
                id: -1,
                completed: false,
                createdAt: new Date(),
              }}
            />
          </div>
        ))}
        {data?.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
      </ul>
    </div>
  );
};

/* 
The TodoItem uses the `useMutation` hook to enable updating and deleting todos.
Optimistic UI updates are demonstrated through immediate visual feedback (like opacity changes)
and are solidified by invalidating and refetching the todos list upon mutation settlement. 
*/

const TodoItem = ({ todo }: { todo: Todo }) => {
  const { id, name, completed } = todo;
  const queryClient = useQueryClient(); // Accessing the query client for cache manipulation

  const { mutate: deleteMutation, isPending: isDeletePending } = useMutation({
    mutationFn: deleteTodo, // Function to delete a todo
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
    mutationKey: ['deleteTodo'],
  });

  const { mutate: updateMutation, isPending: isCompletePending } = useMutation({
    mutationFn: () => updateTodo(id, { ...todo, completed: !completed }), // if completed, set to false, if not, set to true
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
    mutationKey: ['completeTodo'],
  });

  return (
    <li
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg border border-stone-500 bg-stone-900 p-4',
        isDeletePending || isCompletePending ? 'opacity-50' : '', // Adding opacity to the todo item if a mutation is pending
      )}
    >
      <div className={cn(completed && 'line-through opacity-50')}>{name}</div>
      <div className="flex gap-2">
        <button
          onClick={() => updateMutation()}
          className="h-8 w-8 rounded-lg bg-stone-600 px-2 hover:bg-green-800 disabled:bg-stone-500"
          disabled={isDeletePending || isCompletePending}
        >
          {completed ? '↩' : '✓'}
        </button>
        <button
          onClick={() => deleteMutation(id)}
          className="h-8 w-8 rounded-lg bg-stone-600 px-2 hover:bg-red-500 disabled:bg-stone-500"
          disabled={isDeletePending || isCompletePending}
        >
          🗑
        </button>
      </div>
    </li>
  );
};

/* 
The TodoInput component provides an interface for adding new todos. It shows form handling and mutation
with the useMutation hook. The input field is disabled while the mutation is pending, and the button text
changes based on the mutation state. The cache is invalidated and the todos list is refetched upon mutation.
*/
export const TodoInput = () => {
  const [value, setValue] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (name: string) => postTodo(randomUserId, { name }), // Function to post a new todo
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }), // Invalidate todos query to trigger refetch
    mutationKey: ['addTodo'],
  });

  return (
    <div className="flex w-full flex-col gap-2 rounded-md border border-stone-500 bg-stone-900 p-4 sm:flex-row">
      <input
        value={value}
        onChange={({ target }) => setValue(target.value)}
        onKeyDown={({ key }) => {
          if (key === 'Enter') {
            mutate(value); // Triggering the add mutation on Enter key
            setValue(''); // Resetting the input field
          }
        }}
        placeholder="Todo name"
        className="flex-1 rounded-lg p-2 text-black"
      />
      <button
        onClick={() => {
          mutate(value); // Triggering the add mutation on button click
          setValue(''); // Resetting the input field
        }}
        disabled={isPending || !value} // Disabling the button while mutation is pending or input is empty
        className="rounded-lg bg-stone-600 p-4  hover:bg-stone-700 disabled:bg-stone-500"
      >
        {/* Changing button text based on mutation state */}
        {isPending ? 'Adding...' : 'Add todo'}
      </button>
    </div>
  );
};
