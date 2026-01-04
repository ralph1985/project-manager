export function filterMilestonesByProject(milestones, projectId) {
  if (!projectId) return milestones;
  return milestones.filter((milestone) => milestone.projectId === projectId);
}

export function sortMilestones(milestones) {
  return [...milestones].sort((a, b) => {
    const aOrder = Number.isFinite(a.order) ? a.order : Number.POSITIVE_INFINITY;
    const bOrder = Number.isFinite(b.order) ? b.order : Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.title || '').localeCompare(b.title || '');
  });
}

export function isMilestoneDone(milestone) {
  const status = (milestone.status || '').toLowerCase();
  return status === 'done' || status === 'completed' || status === 'completada';
}
