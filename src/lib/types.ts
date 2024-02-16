export type Todo = {
  id: number;
  name: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
};

export type PostTodo = {
  name: string;
  description?: string;
  completed?: boolean;
};
