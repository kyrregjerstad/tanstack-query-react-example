import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { deleteTodo, getTodos, postTodo } from './lib/api';
import { useState } from 'react';

// gets a random user id between 1 and 999
// if you want to use a specific user id, you can replace this with a constant
// e.g const randomUserId = 500;
// all todos are stored in the a database, but deleted after 24 hours
const randomUserId = Math.floor(Math.random() * 999) + 1;

export const Todos = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => getTodos(randomUserId),
  });

  const variables = useMutationState<string>({
    filters: { mutationKey: ['addTodo'], status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
  });

  if (isLoading) {
    return (
      <ul className="flex w-full flex-col gap-4">
        <Todo name={'Loading...'} id={-1} />
      </ul>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

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
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: deleteTodo,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <li className="flex w-full items-center justify-between gap-2 rounded-lg border border-stone-500 bg-stone-900 p-4">
      {name}
      <button
        onClick={() => mutate(id)}
        className="h-8 w-8 rounded-lg bg-stone-600 px-2 hover:bg-red-500"
      >
        X
      </button>
    </li>
  );
};

export const TodoInput = () => {
  const [value, setValue] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (name: string) => postTodo(randomUserId, { name }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
    mutationKey: ['addTodo'],
  });

  return (
    <div className="flex w-full gap-2 rounded-md border border-stone-500 bg-stone-900 p-4">
      <input
        value={value}
        onChange={({ target }) => setValue(target.value)}
        onKeyDown={({ key }) => {
          if (key === 'Enter') {
            mutate(value);
            setValue('');
          }
        }}
        placeholder="Todo name"
        className="flex-1 rounded-lg p-2"
      />
      <button
        onClick={() => {
          mutate(value);
          setValue('');
        }}
        disabled={isPending || !value}
        className="rounded-lg bg-stone-600 px-4 text-white hover:bg-stone-700"
      >
        {isPending ? 'Adding...' : 'Add todo'}
      </button>
    </div>
  );
};
