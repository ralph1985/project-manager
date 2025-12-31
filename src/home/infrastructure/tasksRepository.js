export async function fetchTasks() {
  const res = await fetch('/data/projects-tasks.json');
  if (!res.ok) throw new Error('Failed to load tasks');
  return res.json();
}
