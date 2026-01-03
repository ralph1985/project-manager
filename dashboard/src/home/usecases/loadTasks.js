import { parseDate } from '../domain/date.js';
import { fetchPeople } from '../infrastructure/peopleRepository.js';
import { fetchProjects } from '../infrastructure/projectsRepository.js';
import { fetchTaskEntries } from '../infrastructure/taskEntriesRepository.js';
import { fetchTaskNotes } from '../infrastructure/taskNotesRepository.js';
import { fetchTasks } from '../infrastructure/tasksRepository.js';

function sumEntries(entries) {
  return entries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
}

function formatNotes(notes) {
  return notes
    .sort((a, b) => noteSortValue(a.date) - noteSortValue(b.date))
    .map((note) => (note.date ? `(${note.date}) ${note.note}` : note.note))
    .filter(Boolean)
    .join('\n');
}

function noteSortValue(date) {
  if (!date) return Number.MAX_SAFE_INTEGER;
  return parseDate(date) || Number.MAX_SAFE_INTEGER;
}

export async function loadTasks() {
  const [tasks, projects, people, entries, notes] = await Promise.all([
    fetchTasks(),
    fetchProjects(),
    fetchPeople(),
    fetchTaskEntries(),
    fetchTaskNotes(),
  ]);

  const projectById = new Map(projects.map((project) => [project.id, project]));
  const personById = new Map(people.map((person) => [person.id, person]));
  const entriesByTaskId = new Map();
  const notesByTaskId = new Map();

  entries.forEach((entry) => {
    const current = entriesByTaskId.get(entry.taskId) || [];
    current.push(entry);
    entriesByTaskId.set(entry.taskId, current);
  });

  notes.forEach((note) => {
    const current = notesByTaskId.get(note.taskId) || [];
    current.push(note);
    notesByTaskId.set(note.taskId, current);
  });

  return tasks.map((task) => {
    const project = projectById.get(task.projectId);
    const owner = personById.get(task.ownerId);
    const taskEntries = entriesByTaskId.get(task.id) || [];
    const taskNotes = notesByTaskId.get(task.id) || [];

    return {
      ...task,
      projectId: task.projectId,
      project: project?.name || task.projectId,
      ownerId: task.ownerId,
      owner: owner?.name || task.ownerId,
      entries: taskEntries,
      hours: sumEntries(taskEntries),
      notes: formatNotes(taskNotes),
    };
  });
}
