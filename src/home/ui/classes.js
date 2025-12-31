export function statusClass(status) {
  if (!status) return 'status-No';
  if (status.startsWith('Comp')) return 'status-Completa';
  if (status.startsWith('En')) return 'status-En';
  if (status.startsWith('B')) return 'status-Bloqueada';
  if (status.startsWith('No')) return 'status-No';
  if (status.startsWith('Canc')) return 'status-Cancelada';
  return 'status-No';
}

export function phaseClass(phase) {
  if (!phase) return 'phase-Default';
  if (phase.startsWith('Pre')) return 'phase-Pre';
  if (phase.startsWith('Mant')) return 'phase-Mant';
  return 'phase-Default';
}

export function projectClass(project) {
  if (!project) return 'project-Default';
  if (project.includes('Belmontejo')) return 'project-Belmontejo';
  if (project.includes('Palomares')) return 'project-Palomares';
  if (project.includes('Gestor')) return 'project-Gestor';
  return 'project-Default';
}
