import { fetchTodos } from '../infrastructure/todosRepository.js';
import { filterTodosByProject, sortTodos } from '../domain/todo.js';

export async function loadProjectTodos(project) {
  const todos = await fetchTodos();
  return sortTodos(filterTodosByProject(todos, project));
}
