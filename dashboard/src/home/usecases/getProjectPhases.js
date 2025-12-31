import { buildProjectPhaseTotals } from '../domain/task.js';

export function getProjectPhases(tasks) {
  return buildProjectPhaseTotals(tasks);
}
