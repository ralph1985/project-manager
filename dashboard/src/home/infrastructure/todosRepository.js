import { withBase } from '../config.js';

export async function fetchTodos() {
  const res = await fetch(withBase('/dashboard/data/project-todos.json'));
  if (!res.ok) throw new Error('Failed to load todos');
  return res.json();
}
