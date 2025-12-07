import { PmModal } from '../src/pm-modal';

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('PmModal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('abre y cierra vía API y emite eventos', async () => {
    const modal = new PmModal();
    document.body.appendChild(modal);

    const openSpy = vi.fn();
    const closeSpy = vi.fn();
    modal.addEventListener('pm-open', openSpy);
    modal.addEventListener('pm-close', closeSpy);

    modal.openModal();
    await flush();
    expect(modal.open).toBe(true);
    expect(openSpy).toHaveBeenCalledTimes(1);

    modal.close();
    await flush();
    expect(modal.open).toBe(false);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('cierra al pulsar backdrop cuando close-on-backdrop está activo', async () => {
    const modal = new PmModal();
    modal.openModal();
    document.body.appendChild(modal);
    await flush();

    const backdrop = modal.shadowRoot?.querySelector('.backdrop') as HTMLElement;
    backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(modal.open).toBe(false);
  });
});
