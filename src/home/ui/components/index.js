class PmGrid extends HTMLElement {
  connectedCallback() {
    this.classList.add('grid');
  }
}

class PmCard extends HTMLElement {
  connectedCallback() {
    this.classList.add('card');
  }
}

class PmPill extends HTMLElement {
  connectedCallback() {
    this.classList.add('pill');
  }
}

class PmBadge extends HTMLElement {
  connectedCallback() {
    this.classList.add('badge');
    const variant = this.getAttribute('variant');
    if (variant) {
      this.classList.add(variant);
    }
  }
}

class PmProjectSummary extends HTMLElement {
  connectedCallback() {
    this.classList.add('project-summary');
    const href = this.getAttribute('href');
    if (href) {
      this.setAttribute('role', 'link');
      this.tabIndex = 0;
      this.addEventListener('click', () => {
        window.location.assign(href);
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.location.assign(href);
        }
      });
    }
  }
}

class PmRecentTask extends HTMLElement {
  connectedCallback() {
    this.classList.add('recent-task');
  }
}

customElements.define('pm-grid', PmGrid);
customElements.define('pm-card', PmCard);
customElements.define('pm-pill', PmPill);
customElements.define('pm-badge', PmBadge);
customElements.define('pm-project-summary', PmProjectSummary);
customElements.define('pm-recent-task', PmRecentTask);
