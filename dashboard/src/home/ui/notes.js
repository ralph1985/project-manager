export function setupNotes(elements) {
  const hideNote = () => elements.noteModal.classList.add('hidden');
  const showNote = (text) => {
    elements.noteBody.textContent = text;
    elements.noteModal.classList.remove('hidden');
  };

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.note-link');
    if (btn) {
      event.preventDefault();
      showNote(btn.dataset.note || '');
    }
    if (event.target.classList.contains('modal-backdrop')) {
      hideNote();
    }
  });

  elements.noteClose.addEventListener('click', hideNote);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideNote();
  });
}
