import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('pm-modal')
export class PmModal extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) heading = 'Diálogo';
  @property({ type: Boolean, attribute: 'close-on-backdrop' })
  closeOnBackdrop = true;

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.close();
    }
  };

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 30;
      display: block;
      pointer-events: none;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: linear-gradient(
          125deg,
          rgba(12, 74, 110, 0.12),
          rgba(5, 46, 22, 0.18)
        ),
        rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(3px);
      display: grid;
      align-items: center;
      justify-items: center;
      padding: 1rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 160ms ease-out;
    }

    :host([open]) .backdrop {
      opacity: 1;
      pointer-events: auto;
    }

    .dialog {
      width: min(640px, 100%);
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.3);
      overflow: hidden;
      transform: translateY(8px);
      transition: transform 180ms ease-out;
    }

    :host([open]) .dialog {
      transform: translateY(0);
    }

    .dialog__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.35);
      gap: 0.75rem;
    }

    .dialog__title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
    }

    .dialog__close {
      border: 1px solid rgba(148, 163, 184, 0.6);
      background: #fff;
      border-radius: 10px;
      cursor: pointer;
      padding: 0.45rem;
      line-height: 1;
      display: grid;
      place-items: center;
      color: #0f172a;
      transition: all 120ms ease;
    }

    .dialog__close:hover {
      background: #e2e8f0;
    }

    .dialog__close:focus-visible {
      outline: 2px solid #0284c7;
      outline-offset: 2px;
    }

    .dialog__body {
      padding: 1.25rem;
      color: #0f172a;
      line-height: 1.55;
    }

    .dialog__footer {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0 1.25rem 1.25rem;
      justify-content: flex-end;
    }

    @media (max-width: 640px) {
      .dialog {
        border-radius: 14px;
      }

      .dialog__body,
      .dialog__header,
      .dialog__footer {
        padding-inline: 1rem;
      }
    }
  `;

  openModal() {
    this.open = true;
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('pm-close', { bubbles: true, composed: true })
    );
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('open')) {
      if (this.open) {
        window.addEventListener('keydown', this.handleKeydown);
        this.dispatchEvent(
          new CustomEvent('pm-open', { bubbles: true, composed: true })
        );
      } else {
        window.removeEventListener('keydown', this.handleKeydown);
      }
    }
  }

  disconnectedCallback(): void {
    window.removeEventListener('keydown', this.handleKeydown);
    super.disconnectedCallback();
  }

  private handleBackdropClick(event: MouseEvent) {
    if (!this.closeOnBackdrop) return;
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private handleCloseClick() {
    this.close();
  }

  render() {
    if (!this.open) {
      return html``;
    }

    return html`
      <div class="backdrop" @click=${this.handleBackdropClick}>
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${this.heading}
        >
          <header class="dialog__header">
            <h2 class="dialog__title">
              <slot name="heading">${this.heading}</slot>
            </h2>
            <button
              class="dialog__close"
              type="button"
              aria-label="Cerrar diálogo"
              @click=${this.handleCloseClick}
            >
              ✕
            </button>
          </header>
          <div class="dialog__body">
            <slot></slot>
          </div>
          <footer class="dialog__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pm-modal': PmModal;
  }
}
