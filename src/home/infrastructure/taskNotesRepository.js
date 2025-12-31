export async function fetchTaskNotes() {
  const res = await fetch('/data/task-notes.json');
  if (!res.ok) throw new Error('Failed to load task notes');
  return res.json();
}
