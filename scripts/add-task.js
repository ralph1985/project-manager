#!/usr/bin/env node
// CLI para añadir tareas a data/projects-tasks.json con estructura normalizada.
const { createInterface } = require('node:readline/promises');
const { readFile, writeFile } = require('fs/promises');
const { resolve } = require('path');

const tasksPath = resolve(__dirname, '../data/projects-tasks.json');
const projectsPath = resolve(__dirname, '../data/projects.json');
const peoplePath = resolve(__dirname, '../data/people.json');
const entriesPath = resolve(__dirname, '../data/task-entries.json');
const notesPath = resolve(__dirname, '../data/task-notes.json');

function formatDate(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/--+/g, '-');
}

async function loadJson(path, fallback = []) {
  const raw = await readFile(path, 'utf8');
  return raw ? JSON.parse(raw) : fallback;
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

async function prompt(question, rl, defaultValue = '') {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() || defaultValue;
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

async function main() {
  const [tasks, projects, people, entries, notes] = await Promise.all([
    loadJson(tasksPath),
    loadJson(projectsPath),
    loadJson(peoplePath),
    loadJson(entriesPath),
    loadJson(notesPath),
  ]);

  const today = formatDate();
  const unique = (list) => Array.from(new Set(list.filter(Boolean))).sort();
  const phasesList = unique(tasks.map((t) => t.phase));
  const statusList = unique(tasks.map((t) => t.status));
  const projectsList = projects.map((project) => project.name);
  const peopleList = people.map((person) => person.name);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const title = await (async () => {
    while (true) {
      const value = await prompt('Título', rl);
      if (value) return value;
      console.log('El título es obligatorio.');
    }
  })();

  const phaseDefault = phasesList.includes('Pre-release')
    ? 'Pre-release'
    : phasesList.includes('Fase 1')
      ? 'Fase 1'
      : phasesList[0] || 'Pre-release';
  const phase = await prompt(
    `Fase (opciones: ${phasesList.join(', ') || 'libre'})`,
    rl,
    phaseDefault
  );

  const ownerDefault = peopleList.includes('Rafael García') ? 'Rafael García' : peopleList[0] || '';
  const owner = await prompt('Responsable', rl, ownerDefault);

  const statusDefault =
    statusList.includes('En curso') || statusList.length === 0
      ? 'En curso'
      : statusList[0];
  const status = await prompt(
    `Estado (opciones: ${statusList.join(', ') || 'libre'})`,
    rl,
    statusDefault
  );
  const startDate = await prompt('Fecha inicio (dd/mm/aaaa)', rl, today);
  const endDateInput = await prompt(
    'Fecha fin (dd/mm/aaaa, dejar vacío si sigue en curso)',
    rl,
    ''
  );
  const hoursInput = await prompt('Horas empleadas', rl, '2.0');
  const notesInput = await prompt('Notas', rl, '');

  const projectDefault = projectsList.includes('Gestor de proyectos')
    ? 'Gestor de proyectos'
    : projectsList[0] || 'Gestor de proyectos';
  const projectName = await prompt(
    `Proyecto (opciones: ${projectsList.join(', ') || 'libre'})`,
    rl,
    projectDefault
  );

  rl.close();

  let project = projects.find((item) => item.name === projectName);
  if (!project) {
    project = {
      id: slugify(projectName) || `project-${projects.length + 1}`,
      name: projectName,
      status: 'active',
      ticktickProjectId: null,
    };
    projects.push(project);
  }

  let person = people.find((item) => item.name === owner);
  if (!person) {
    person = {
      id: slugify(owner) || `person-${people.length + 1}`,
      name: owner,
    };
    people.push(person);
  }

  const task = {
    id: nextId(tasks),
    title,
    projectId: project.id,
    phase,
    status,
    ownerId: person.id,
    startDate: startDate || null,
    endDate: endDateInput || null,
  };

  tasks.push(task);

  const entryDate = endDateInput || startDate || null;
  const hours = hoursInput ? parseFloat(hoursInput) : null;
  if (Number.isFinite(hours)) {
    entries.push({
      id: nextId(entries),
      taskId: task.id,
      date: entryDate,
      hours,
      note: '',
    });
  }

  const parsedNotes = parseNotes(notesInput, entryDate);
  parsedNotes.forEach((note) => {
    notes.push({
      id: nextId(notes),
      taskId: task.id,
      date: note.date,
      note: note.note,
    });
  });

  await Promise.all([
    writeFile(tasksPath, `${JSON.stringify(tasks, null, 2)}\n`),
    writeFile(projectsPath, `${JSON.stringify(projects, null, 2)}\n`),
    writeFile(peoplePath, `${JSON.stringify(people, null, 2)}\n`),
    writeFile(entriesPath, `${JSON.stringify(entries, null, 2)}\n`),
    writeFile(notesPath, `${JSON.stringify(notes, null, 2)}\n`),
  ]);

  console.log('\nTarea añadida:');
  console.log(`- id: ${task.id}`);
  console.log(`- título: ${task.title}`);
  console.log(`- proyecto: ${project.name}`);
}

main().catch((err) => {
  console.error('Error al añadir la tarea:', err);
  process.exit(1);
});
