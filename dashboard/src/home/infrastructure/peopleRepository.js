export async function fetchPeople() {
  const res = await fetch('/dashboard/data/people.json');
  if (!res.ok) throw new Error('Failed to load people');
  return res.json();
}
