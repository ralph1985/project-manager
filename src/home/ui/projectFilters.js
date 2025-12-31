function setSelected(select, values = []) {
  Array.from(select.options).forEach((opt) => {
    opt.selected = values.includes(opt.value);
  });
}

export function applySavedProjectFilters(elements, saved) {
  const legacySingleDate = saved.date || '';
  elements.search.value = saved.search || '';
  elements.dateStartFilter.value = saved.dateStart ?? legacySingleDate ?? '';
  elements.dateEndFilter.value = saved.dateEnd ?? legacySingleDate ?? '';
  setSelected(elements.statusFilter, saved.status);
  setSelected(elements.ownerFilter, saved.owner);
  setSelected(elements.phaseFilter, saved.phase);
}

export function readProjectFilters(elements) {
  const selectedValues = (select) => Array.from(select.selectedOptions).map((o) => o.value);

  return {
    search: elements.search.value,
    status: selectedValues(elements.statusFilter),
    owner: selectedValues(elements.ownerFilter),
    phase: selectedValues(elements.phaseFilter),
    project: [],
    dateStart: elements.dateStartFilter.value,
    dateEnd: elements.dateEndFilter.value,
  };
}
