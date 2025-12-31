export async function fetchTickTickProjects(options = {}) {
  const refresh = options.refresh ? '?refresh=1' : '';
  const res = await fetch(`/api/ticktick/projects${refresh}`);
  if (!res.ok) throw new Error('Failed to load TickTick projects');
  return res.json();
}

export async function fetchTickTickTasks(projectId, options = {}) {
  const refresh = options.refresh ? '?refresh=1' : '';
  const res = await fetch(`/api/ticktick/projects/${projectId}/tasks${refresh}`);
  if (!res.ok) throw new Error('Failed to load TickTick tasks');
  return res.json();
}
