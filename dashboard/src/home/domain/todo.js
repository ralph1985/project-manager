export function filterTodosByProject(todos, projectId) {
  if (!projectId) return todos;
  return todos.filter((todo) => todo.projectId === projectId);
}

export function sortTodos(todos) {
  return [...todos].sort((a, b) => parseDateValue(a.dueDate) - parseDateValue(b.dueDate));
}

export function isTodoDone(todo) {
  return todo.status === 'Completada' || todo.status === 'Done';
}

function parseDateValue(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  if (value.includes('/')) {
    const parts = value.split('/').map(Number);
    if (parts.length === 3 && !Number.isNaN(parts[2])) {
      const parsed = new Date(parts[2], parts[1] - 1, parts[0]);
      if (!Number.isNaN(parsed.valueOf())) return parsed.valueOf();
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return Number.MAX_SAFE_INTEGER;
  return parsed.valueOf();
}
