export function filterTodosByProject(todos, project) {
  if (!project) return todos;
  return todos.filter((todo) => todo.project === project);
}

export function sortTodos(todos) {
  return [...todos].sort((a, b) => parseDateValue(a.dueDate) - parseDateValue(b.dueDate));
}

function parseDateValue(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return Number.MAX_SAFE_INTEGER;
  return parsed.valueOf();
}
