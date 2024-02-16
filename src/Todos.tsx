import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { completeTodo, deleteTodo, getTodos, postTodo } from './lib/api';
import { useState } from 'react';
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
        <Todo name={'Loading...'} id={-1} />
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
        {variables.map((name, index) => (
          <div className="opacity-50">
            <Todo key={index} name={name} id={index} />
          </div>
        ))}
        {data?.map((todo) => (
          <Todo key={todo.id} name={todo.name} id={todo.id} />
        ))}
      </ul>
    </div>
  );
};

const Todo = ({ name, id }: { name: string; id: number }) => {
  const queryClient = useQueryClient(); // Accessing the query client for cache manipulation

  // useMutation hook to handle todo deletion, with cache invalidation on mutation settlement
  const { mutate: deleteMutation, isPending: isDeletePending } = useMutation({
    mutationFn: deleteTodo, // Function to delete a todo
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }), // Invalidate todos query to trigger refetch
    mutationKey: ['deleteTodo'], // Key for this mutation
  });

  const { mutate: completeMutation, isPending: isCompletePending } =
    useMutation({
      mutationFn: completeTodo,
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
      mutationKey: ['completeTodo'],
    });

  // Rendering the todo item with a delete button
  return (
    <li
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg border border-stone-500 bg-stone-900 p-4',
        isDeletePending || isCompletePending ? 'opacity-50' : '', // Adding opacity to the todo item if a mutation is pending
      )}
    >
      {name}
      <div className="flex gap-2">
        <button
          onClick={() => completeMutation(id)}
          className="h-8 w-8 rounded-lg bg-stone-600 px-2 hover:bg-stone-700 disabled:bg-stone-500"
          disabled={isDeletePending || isCompletePending}
        >
          V
        </button>
        <button
          onClick={() => deleteMutation(id)}
          className="h-8 w-8 rounded-lg bg-stone-600 px-2 hover:bg-red-500 disabled:bg-stone-500"
          disabled={isDeletePending || isCompletePending}
        >
          X
        </button>
      </div>
    </li>
  );
};

export const TodoInput = () => {
  const [value, setValue] = useState(''); // State to hold the input value
  const queryClient = useQueryClient(); // Accessing the query client for cache manipulation

  // `useMutation` hook for adding a new todo, with cache invalidation on mutation settlement
  const { mutate, isPending } = useMutation({
    mutationFn: (name: string) => postTodo(randomUserId, { name }), // Function to post a new todo
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }), // Invalidate todos query to trigger refetch
    mutationKey: ['addTodo'], // Key for this mutation
  });

  // Rendering the input field with an add button
  return (
    <div className="flex w-full gap-2 rounded-md border border-stone-500 bg-stone-900 p-4">
      <input
        value={value}
        onChange={({ target }) => setValue(target.value)} // Updating the state with input value
        onKeyDown={({ key }) => {
          if (key === 'Enter') {
            mutate(value); // Triggering the add mutation on Enter key
            setValue(''); // Resetting the input field
          }
        }}
        placeholder="Todo name"
        className="flex-1 rounded-lg p-2"
      />
      <button
        onClick={() => {
          mutate(value); // Triggering the add mutation on button click
          setValue(''); // Resetting the input field
        }}
        disabled={isPending || !value} // Disabling the button while mutation is pending or input is empty
        className="rounded-lg bg-stone-600 px-4 hover:bg-stone-700 disabled:bg-stone-500"
      >
        {isPending ? 'Adding...' : 'Add todo'}
        {/* Changing button text based on mutation state */}
      </button>
    </div>
  );
};
