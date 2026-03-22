import { withBase } from '../config.js';

export async function fetchPeople() {
  const res = await fetch(withBase('/dashboard/data/people.json'));
  if (!res.ok) throw new Error('Failed to load people');
  return res.json();
}
