import { summarizeProjects } from '../domain/task.js';

export function getProjectSummaries(tasks) {
  return summarizeProjects(tasks);
}
