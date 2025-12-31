export async function fetchTaskEntries() {
  const res = await fetch('/dashboard/data/task-entries.json');
  if (!res.ok) throw new Error('Failed to load task entries');
  return res.json();
}
