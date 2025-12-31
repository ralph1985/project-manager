import { filterMilestonesByProject, sortMilestones } from '../domain/milestone.js';
import { fetchMilestones } from '../infrastructure/milestonesRepository.js';

export async function loadProjectMilestones(projectId) {
  const milestones = await fetchMilestones();
  return sortMilestones(filterMilestonesByProject(milestones, projectId));
}
