import { parseDate, parseInputDate } from './date.js';

export function normalizeTask(task) {
  const projectFallback = ['Fase 1', 'Mantenimiento', 'Errores'].includes(task.phase)
    ? 'Ayuntamiento de Belmontejo'
    : task.project || null;
  return {
    ...task,
    project: task.project || projectFallback,
  };
}

export function sortTasks(tasks, sortState) {
  const sorters = {
    id: (t) => t.id,
    title: (t) => (t.title || '').toLowerCase(),
    project: (t) => (t.project || '').toLowerCase(),
    phase: (t) => (t.phase || '').toLowerCase(),
    owner: (t) => (t.owner || '').toLowerCase(),
    status: (t) => (t.status || '').toLowerCase(),
    startDate: (t) => parseDate(t.startDate),
    endDate: (t) => parseDate(t.endDate),
    hours: (t) => t.hours || 0,
  };
  const fn = sorters[sortState.key] || sorters.id;
  const dir = sortState.dir === 'asc' ? 1 : -1;
  return [...tasks].sort((a, b) => {
    const va = fn(a);
    const vb = fn(b);
    if (va === vb) return 0;
    return va > vb ? dir : -dir;
  });
}

export function buildFilterOptions(tasks) {
  return {
    statuses: Array.from(new Set(tasks.map((t) => t.status))).sort(),
    owners: Array.from(new Set(tasks.map((t) => t.owner))).sort(),
    phases: Array.from(new Set(tasks.map((t) => t.phase))).sort(),
    projects: Array.from(new Set(tasks.map((t) => t.project))).sort(),
  };
}

export function applyFilters(tasks, filters) {
  const term = (filters.search || '').toLowerCase().trim();
  const statusValues = normalizeSelected(filters.status);
  const ownerValues = normalizeSelected(filters.owner);
  const phaseValues = normalizeSelected(filters.phase);
  const projectValues = normalizeSelected(filters.project);
  const dateStartValue = filters.dateStart || '';
  const dateEndValue = filters.dateEnd || '';
  const hasDateRange = Boolean(dateStartValue || dateEndValue);
  const rangeStart = parseInputDate(dateStartValue, -Infinity);
  const rangeEnd = parseInputDate(dateEndValue, Infinity);

  return tasks.filter((task) => {
    const matchesTerm =
      !term || `${task.title} ${task.notes || ''}`.toLowerCase().includes(term);
    const matchesStatus = statusValues.length === 0 || statusValues.includes(task.status);
    const matchesOwner = ownerValues.length === 0 || ownerValues.includes(task.owner);
    const matchesPhase = phaseValues.length === 0 || phaseValues.includes(task.phase);
    const matchesProject = projectValues.length === 0 || projectValues.includes(task.project);
    const taskStart = parseDate(task.startDate);
    const taskEnd = parseDate(task.endDate) || taskStart;
    const hasTaskDate = Boolean(taskStart || taskEnd);
    const matchesDate =
      !hasDateRange || (hasTaskDate && taskEnd >= rangeStart && taskStart <= rangeEnd);

    return (
      matchesTerm &&
      matchesStatus &&
      matchesOwner &&
      matchesPhase &&
      matchesProject &&
      matchesDate
    );
  });
}

export function aggregate(tasks, key) {
  return tasks.reduce((acc, task) => {
    const k = task[key] || '—';
    const current = acc[k] || { hours: 0, count: 0 };
    acc[k] = { hours: current.hours + (task.hours || 0), count: current.count + 1 };
    return acc;
  }, {});
}

export function buildProjectPhaseTotals(tasks) {
  return tasks.reduce(
    (acc, task) => {
      const project = task.project || 'Sin proyecto';
      const phase = task.phase || '—';
      const phaseKey = `${project}::${phase}`;
      acc.projects[project] = (acc.projects[project] || 0) + (task.hours || 0);
      acc.phases[phaseKey] = (acc.phases[phaseKey] || 0) + (task.hours || 0);
      return acc;
    },
    { projects: {}, phases: {} }
  );
}

export function countStatuses(tasks) {
  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
}

function normalizeSelected(values) {
  if (!Array.isArray(values)) return [];
  return values.includes('') ? [] : values.filter(Boolean);
}
