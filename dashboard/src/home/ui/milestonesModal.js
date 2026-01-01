export function setupMilestonesModal(elements) {
  if (!elements.milestoneModal) return;

  const hideModal = () => elements.milestoneModal.classList.add('hidden');
  const showModal = (title, details) => {
    elements.milestoneTitle.textContent = title || 'Hito';
    elements.milestoneBody.textContent = details || 'Sin detalle.';
    elements.milestoneModal.classList.remove('hidden');
  };

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.milestone-link');
    if (btn) {
      event.preventDefault();
      showModal(btn.dataset.title || '', btn.dataset.details || '');
    }
    if (event.target.classList.contains('modal-backdrop')) {
      hideModal();
    }
  });

  elements.milestoneClose.addEventListener('click', hideModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideModal();
  });
}
