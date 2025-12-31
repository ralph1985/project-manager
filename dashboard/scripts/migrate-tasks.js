#!/usr/bin/env node
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const legacyPath = resolve(root, 'data', 'projects-tasks.json');
const backupPath = resolve(root, 'data', 'projects-tasks.legacy.json');
const projectsPath = resolve(root, 'data', 'projects.json');
const peoplePath = resolve(root, 'data', 'people.json');
const tasksPath = resolve(root, 'data', 'projects-tasks.json');
const entriesPath = resolve(root, 'data', 'task-entries.json');
const notesPath = resolve(root, 'data', 'task-notes.json');

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/--+/g, '-');
}

function parseNotes(notes, fallbackDate) {
  if (!notes) return [];
  return notes
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^\((\d{1,2}\/\d{1,2}\/\d{4})\)\s*(.*)$/);
      if (match) {
        return { date: match[1], note: match[2] || '' };
      }
      return { date: fallbackDate || null, note: line };
    });
}

function main() {
  if (!existsSync(legacyPath)) {
    console.error('No se encuentra data/projects-tasks.json');
    process.exit(1);
  }

  const legacyRaw = readFileSync(legacyPath, 'utf8');
  const legacyTasks = JSON.parse(legacyRaw);

  if (!existsSync(backupPath)) {
    writeFileSync(backupPath, `${JSON.stringify(legacyTasks, null, 2)}\n`);
  }

  const projectsMap = new Map();
  const peopleMap = new Map();
  const tasks = [];
  const entries = [];
  const notes = [];

  let entryId = 1;
  let noteId = 1;

  legacyTasks.forEach((task) => {
    const projectName = task.project || 'Sin proyecto';
    if (!projectsMap.has(projectName)) {
      projectsMap.set(projectName, {
        id: slugify(projectName) || `project-${projectsMap.size + 1}`,
        name: projectName,
        status: 'active',
        ticktickProjectId: null,
      });
    }

    const ownerName = task.owner || 'Sin asignar';
    if (!peopleMap.has(ownerName)) {
      peopleMap.set(ownerName, {
        id: slugify(ownerName) || `person-${peopleMap.size + 1}`,
        name: ownerName,
      });
    }

    const projectId = projectsMap.get(projectName).id;
    const ownerId = peopleMap.get(ownerName).id;
    const normalizedTask = {
      id: task.id,
      title: task.title,
      projectId,
      phase: task.phase || null,
      status: task.status || null,
      ownerId,
      startDate: task.startDate || null,
      endDate: task.endDate || null,
    };
    tasks.push(normalizedTask);

    const hours = typeof task.hours === 'number' ? task.hours : null;
    const entryDate = task.endDate || task.startDate || null;
    if (hours !== null) {
      entries.push({
        id: entryId++,
        taskId: task.id,
        date: entryDate,
        hours,
        note: '',
      });
    }

    const parsedNotes = parseNotes(task.notes, entryDate);
    parsedNotes.forEach((note) => {
      notes.push({
        id: noteId++,
        taskId: task.id,
        date: note.date,
        note: note.note,
      });
    });
  });

  const projects = Array.from(projectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const people = Array.from(peopleMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  tasks.sort((a, b) => a.id - b.id);

  writeFileSync(projectsPath, `${JSON.stringify(projects, null, 2)}\n`);
  writeFileSync(peoplePath, `${JSON.stringify(people, null, 2)}\n`);
  writeFileSync(tasksPath, `${JSON.stringify(tasks, null, 2)}\n`);
  writeFileSync(entriesPath, `${JSON.stringify(entries, null, 2)}\n`);
  writeFileSync(notesPath, `${JSON.stringify(notes, null, 2)}\n`);

  console.log('Migracion completada:');
  console.log(`- projects: ${projects.length}`);
  console.log(`- people: ${people.length}`);
  console.log(`- tasks: ${tasks.length}`);
  console.log(`- entries: ${entries.length}`);
  console.log(`- notes: ${notes.length}`);
}

main();
