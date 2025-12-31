export async function fetchTodos() {
  const res = await fetch('/data/project-todos.json');
  if (!res.ok) throw new Error('Failed to load todos');
  return res.json();
}
