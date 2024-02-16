import './index.css';

import { TodoInput, Todos } from './Todos';

function App() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-8 text-white">
        <div className="flex w-full max-w-[500px] flex-col items-center gap-8">
          <TodoInput />
          <Todos />
        </div>
      </main>
    </>
  );
}

export default App;
