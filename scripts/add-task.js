#!/usr/bin/env node
// CLI para añadir tareas a data/projects-tasks.json de forma interactiva.
const { createInterface } = require('node:readline/promises');
const { readFile, writeFile } = require('fs/promises');
const { resolve } = require('path');

const tasksPath = resolve(__dirname, '../data/projects-tasks.json');

function formatDate(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function loadTasks() {
  const raw = await readFile(tasksPath, 'utf8');
  return JSON.parse(raw);
}

function nextId(tasks) {
  return tasks.reduce((max, t) => Math.max(max, t.id || 0), 0) + 1;
}

async function prompt(question, rl, defaultValue = '') {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() || defaultValue;
}

async function main() {
  const tasks = await loadTasks();
  const today = formatDate();
  const unique = (list) => Array.from(new Set(list.filter(Boolean))).sort();
  const phasesList = unique(tasks.map((t) => t.phase));
  const statusList = unique(tasks.map((t) => t.status));
  const projectsList = unique(tasks.map((t) => t.project));

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
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
  const owner = await prompt('Responsable', rl, 'Rafael García');
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
  const endDateInput = await prompt('Fecha fin (dd/mm/aaaa, dejar vacío si sigue en curso)', rl, '');
  const hoursInput = await prompt('Horas empleadas', rl, '2.0');
  const notes = await prompt('Notas', rl, '');
  const projectDefault =
    projectsList.includes('Gestor de proyectos') || projectsList.length === 0
      ? 'Gestor de proyectos'
      : projectsList[0];
  const project = await prompt(
    `Proyecto (opciones: ${projectsList.join(', ') || 'libre'})`,
    rl,
    projectDefault
  );

  rl.close();

  const task = {
    id: nextId(tasks),
    title,
    phase,
    owner,
    status,
    startDate: startDate || null,
    endDate: endDateInput || null,
    hours: hoursInput ? parseFloat(hoursInput) : null,
    notes,
    project
  };

  tasks.push(task);
  await writeFile(tasksPath, `${JSON.stringify(tasks, null, 2)}\n`);

  console.log('\nTarea añadida:');
  console.log(`- id: ${task.id}`);
  console.log(`- título: ${task.title}`);
  console.log(`- proyecto: ${task.project}`);
}

main().catch((err) => {
  console.error('Error al añadir la tarea:', err);
  process.exit(1);
});
