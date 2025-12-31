export async function fetchMilestones() {
  const res = await fetch('/dashboard/data/project-milestones.json');
  if (!res.ok) throw new Error('Failed to load milestones');
  return res.json();
}
