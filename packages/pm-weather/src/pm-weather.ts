import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fetchWeatherApi } from 'openmeteo';

type WeatherDay = {
  time: string | number;
  max: number;
  min: number;
  code: number;
  description: string;
};

type WeatherLabels = {
  linkLabel: string;
  compactHeading: string;
  fullHeading: string;
  fullDescription: string;
  loadingCompact: string;
  loadingFull: string;
  invalidCoordinates: string;
  apiError: string;
  maxLabel: string;
  minLabel: string;
  updatedLabel: string;
  sourceLabel: string;
  sourceName: string;
};

type WeatherLocale = 'en' | 'es';

const labelsByLocale: Record<WeatherLocale, WeatherLabels> = {
  en: {
    linkLabel: 'See 7-day forecast',
    compactHeading: 'Today',
    fullHeading: '7-day forecast',
    fullDescription:
      'Check the expected conditions to plan activities and visits ahead of time.',
    loadingCompact: 'Loading...',
    loadingFull: 'Loading forecast...',
    invalidCoordinates: 'Invalid coordinates.',
    apiError: 'Unable to load weather.',
    maxLabel: 'Max',
    minLabel: 'Min',
    updatedLabel: 'Updated',
    sourceLabel: 'Source:',
    sourceName: 'Open-Meteo',
  },
  es: {
    linkLabel: 'Ver previsión 7 días',
    compactHeading: 'El tiempo hoy',
    fullHeading: 'Previsión para los próximos 7 días',
    fullDescription:
      'Consulta el estado del tiempo previsto para planificar actividades y visitas con antelación.',
    loadingCompact: 'Cargando...',
    loadingFull: 'Cargando previsión...',
    invalidCoordinates: 'Coordenadas no válidas.',
    apiError: 'No se pudo cargar el tiempo.',
    maxLabel: 'Max',
    minLabel: 'Min',
    updatedLabel: 'Actualizado',
    sourceLabel: 'Datos:',
    sourceName: 'Open-Meteo',
  },
};

const codeLabelsByLocale: Record<WeatherLocale, Record<number, string>> = {
  en: {
    0: 'Clear sky',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  },
  es: {
    0: 'Despejado',
    1: 'Mayormente despejado',
    2: 'Parcialmente nuboso',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla con escarcha',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna intensa',
    56: 'Llovizna helada ligera',
    57: 'Llovizna helada intensa',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia intensa',
    66: 'Lluvia helada ligera',
    67: 'Lluvia helada intensa',
    71: 'Nieve ligera',
    73: 'Nieve moderada',
    75: 'Nieve intensa',
    77: 'Granizo',
    80: 'Chubascos ligeros',
    81: 'Chubascos moderados',
    82: 'Chubascos intensos',
    85: 'Chubascos de nieve ligeros',
    86: 'Chubascos de nieve intensos',
    95: 'Tormenta',
    96: 'Tormenta con granizo ligero',
    99: 'Tormenta con granizo intenso',
  },
};

type WeatherData = {
  current: {
    temp: number | null;
    code: number | null;
    time: string | number;
    max: number | null;
    min: number | null;
    description: string;
  };
  days: WeatherDay[];
  timeZone?: string;
};

@customElement('pm-weather')
export class PmWeather extends LitElement {
  @property({ type: Number }) latitude?: number;
  @property({ type: Number }) longitude?: number;
  @property({ type: String, reflect: true }) variant: 'compact' | 'full' = 'full';
  @property({ type: String }) locale = 'en-US';
  @property({ type: Number, attribute: 'cache-ttl-hours' }) cacheTtlHours = 24;
  @property({ type: String, attribute: 'link-url' }) linkUrl?: string;
  @property({ type: String, attribute: 'link-label' }) linkLabel?: string;
  @property({ type: String }) heading?: string;

  @state() private loading = true;
  @state() private error: '' | 'invalid' | 'api' = '';
  @state() private data: WeatherData | null = null;
  @state() private timeZone?: string;

  static styles = css`
    :host {
      display: block;
      font-family: inherit;
      color: var(--text-primary, #2e2e2e);
    }

    :host([variant='compact']) {
      color: var(--text-white, #f5f1e9);
    }

    .weather {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .weather__header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .weather__title {
      font-size: 1.4rem;
      font-weight: 800;
      margin: 0;
      color: inherit;
    }

    :host([variant='compact']) .weather__title {
      font-size: 1.05rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .weather__text {
      margin: 0;
      color: var(--text-secondary, #6e6e6e);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    :host([variant='compact']) .weather__text {
      color: var(--weather-compact-text, rgba(245, 241, 233, 0.8));
    }

    .weather__panel {
      padding: 1.5rem;
      border-radius: 1.25rem;
      background: var(
        --weather-panel-bg,
        var(--background-main, #faf9f7)
      );
      border: 1px solid
        var(--weather-panel-border, var(--border-color, #ddd6ce));
      box-shadow: var(
        --weather-panel-shadow,
        0 18px 40px rgba(46, 46, 46, 0.08)
      );
    }

    :host([variant='compact']) .weather__panel {
      padding: 0;
      background: transparent;
      border: 0;
      box-shadow: none;
    }

    .weather__summary {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.75rem 1.25rem;
      align-items: center;
    }

    .weather__summary-info {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .weather__temp {
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary, #285c8d);
    }

    :host([variant='compact']) .weather__temp {
      color: inherit;
      font-size: 1.4rem;
    }

    .weather__desc {
      font-size: 1rem;
      font-weight: 600;
    }

    .weather__meta {
      font-size: 0.9rem;
      color: var(--text-secondary, #6e6e6e);
    }

    :host([variant='compact']) .weather__meta {
      color: var(--weather-compact-muted, rgba(245, 241, 233, 0.8));
    }

    .weather__link {
      font-size: 0.9rem;
      text-decoration: underline;
      color: inherit;
      transition: color 0.2s ease;
    }

    .weather__source {
      color: inherit;
      text-decoration: underline;
    }

    .weather__grid {
      margin-top: 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 1rem;
    }

    .weather__card {
      background: var(--weather-card-bg, #fff);
      border-radius: 1rem;
      padding: 1rem;
      border: 1px solid var(--weather-card-border, rgba(40, 92, 141, 0.15));
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .weather__card:hover {
      transform: translateY(-4px);
      box-shadow: var(
        --weather-card-shadow,
        0 14px 24px rgba(40, 92, 141, 0.15)
      );
    }

    .weather__day {
      font-weight: 700;
    }

    .weather__date {
      font-size: 0.9rem;
      color: var(--text-secondary, #6e6e6e);
    }

    .weather__icon {
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--primary, #285c8d);
    }

    :host([variant='compact']) .weather__icon {
      width: 1.4rem;
      height: 1.4rem;
      color: var(--primaryLight, #5e8cc0);
    }

    .weather__icon svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .weather__footer {
      margin-top: 1rem;
      text-align: right;
      font-size: 0.85rem;
      color: var(--text-secondary, #6e6e6e);
    }

    :host([variant='compact']) .weather__footer {
      text-align: left;
      color: var(--weather-compact-footer, rgba(245, 241, 233, 0.75));
    }

    .weather__status {
      font-size: 0.95rem;
    }

    .weather__error {
      color: var(--accentLight, #e27a58);
      font-size: 0.95rem;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.loadWeather();
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('latitude') || changed.has('longitude')) {
      this.loadWeather();
    }
    if (changed.has('locale') && this.data) {
      const days = this.data.days.map(day => ({
        ...day,
        description: this.describeCode(day.code),
      }));
      const currentCode = this.data.current.code;
      const fallbackCode = days[0]?.code ?? 3;
      this.data = {
        ...this.data,
        current: {
          ...this.data.current,
          description: this.describeCode(
            typeof currentCode === 'number' ? currentCode : fallbackCode
          ),
        },
        days,
      };
    }
  }

  private get cacheKey() {
    return `pm-weather:${this.latitude}:${this.longitude}`;
  }

  private get cacheTtlMs() {
    const hours = Number.isFinite(this.cacheTtlHours)
      ? this.cacheTtlHours
      : 24;
    return Math.max(1, hours) * 60 * 60 * 1000;
  }

  private readCache(): WeatherData | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(this.cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        data?: WeatherData;
        expiresAt?: number;
      };
      if (!parsed?.expiresAt || !parsed.data) {
        return null;
      }
      if (Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(this.cacheKey);
        return null;
      }
      return parsed.data;
    } catch (error) {
      return null;
    }
  }

  private writeCache(data: WeatherData) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          data,
          expiresAt: Date.now() + this.cacheTtlMs,
        })
      );
    } catch (error) {
      // Ignore storage errors.
    }
  }

  private async loadWeather() {
    const latitude = Number(this.latitude);
    const longitude = Number(this.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      this.loading = false;
      this.error = 'invalid';
      return;
    }

    const cached = this.readCache();
    if (cached) {
      this.data = cached;
      this.timeZone = cached.timeZone;
      this.loading = false;
      this.error = '';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const params = {
        latitude,
        longitude,
        current: ['temperature_2m', 'weather_code'],
        daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min'],
        timezone: 'auto',
      };

      const responses = await fetchWeatherApi(
        'https://api.open-meteo.com/v1/forecast',
        params
      );
      const response = responses[0];
      const current = response.current();
      const daily = response.daily();

      if (!current || !daily) {
        throw new Error('Invalid forecast');
      }

      const currentTime = Number(current.time()) * 1000;
      const currentTemp = current.variables(0)?.value();
      const currentCode = current.variables(1)?.value();

      const dailyTime = Array.from(
        {
          length:
            (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval(),
        },
        (_, index) =>
          (Number(daily.time()) + index * daily.interval()) * 1000
      );
      const dailyCodes = Array.from(
        (daily.variables(0)?.valuesArray() ?? []) as number[]
      );
      const dailyMax = Array.from(
        (daily.variables(1)?.valuesArray() ?? []) as number[]
      );
      const dailyMin = Array.from(
        (daily.variables(2)?.valuesArray() ?? []) as number[]
      );

      if (
        dailyTime.length === 0 ||
        dailyCodes.length === 0 ||
        dailyMax.length === 0 ||
        dailyMin.length === 0
      ) {
        throw new Error('Invalid daily data');
      }

      const days = dailyTime.map((time, index) => {
        const code = Number(dailyCodes[index] ?? 3);
        return {
          time,
          max: Math.round(dailyMax[index]),
          min: Math.round(dailyMin[index]),
          code,
          description: this.describeCode(code),
        };
      });

      const today = days[0];

      const timeZone =
        typeof response.timezone === 'function' ? response.timezone() : undefined;

      const data: WeatherData = {
        current: {
          temp: Number.isFinite(currentTemp) ? Math.round(currentTemp) : null,
          code: typeof currentCode === 'number' ? currentCode : null,
          time: currentTime,
          max: today?.max ?? null,
          min: today?.min ?? null,
          description: this.describeCode(
            typeof currentCode === 'number' ? currentCode : today?.code ?? 3
          ),
        },
        days,
        timeZone,
      };

      this.data = data;
      this.timeZone = timeZone;
      this.loading = false;
      this.writeCache(data);
    } catch (error) {
      this.loading = false;
      this.error = 'api';
    }
  }

  private describeCode(code: number) {
    const labels = codeLabelsByLocale[this.localeKey] ?? codeLabelsByLocale.en;
    if (labels[code]) return labels[code];
    return this.localeKey === 'es'
      ? 'Condiciones variables'
      : 'Variable conditions';
  }

  private get resolvedLabels(): WeatherLabels {
    return labelsByLocale[this.localeKey] ?? labelsByLocale.en;
  }

  private get localeKey(): WeatherLocale {
    const normalized = this.locale.toLowerCase();
    if (normalized.startsWith('es')) {
      return 'es';
    }
    return 'en';
  }

  private formatTime(value: string | number) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--:--';
    return new Intl.DateTimeFormat(this.locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.timeZone,
    }).format(date);
  }

  private formatDay(value: string | number) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(this.locale, {
      weekday: 'long',
      timeZone: this.timeZone,
    }).format(date);
  }

  private formatDate(value: string | number) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(this.locale, {
      day: '2-digit',
      month: 'short',
      timeZone: this.timeZone,
    }).format(date);
  }

  private iconFor(code: number | null) {
    const type = this.iconType(code ?? 3);
    switch (type) {
      case 'sun':
        return html`
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5"></circle>
            <path
              d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"
            ></path>
          </svg>
        `;
      case 'partly':
        return html`
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 13a5 5 0 0 1 9.7-1.7A4 4 0 1 1 18 21H8a4 4 0 0 1-1-8"
            ></path>
            <path d="M10 4.5v2M5.8 6.2l1.4 1.4M4.5 10h2"></path>
          </svg>
        `;
      case 'fog':
        return html`
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 10h16M6 14h12M5 18h14"></path>
          </svg>
        `;
      case 'rain':
        return html`
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 13a5 5 0 0 1 9.7-1.7A4 4 0 1 1 18 21H8a4 4 0 0 1-1-8"
            ></path>
            <path d="M8 18.5l-1 2M12 18.5l-1 2M16 18.5l-1 2"></path>
          </svg>
        `;
      case 'snow':
        return html`
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 13a5 5 0 0 1 9.7-1.7A4 4 0 1 1 18 21H8a4 4 0 0 1-1-8"
            ></path>
            <path d="M9 18.5h0.01M12 19.5h0.01M15 18.5h0.01"></path>
          </svg>
        `;
      case 'storm':
        return html`
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 13a5 5 0 0 1 9.7-1.7A4 4 0 1 1 18 21H8a4 4 0 0 1-1-8"
            ></path>
            <path d="M12 16l-2 4h2l-1.5 3"></path>
          </svg>
        `;
      default:
        return html`
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 13a5 5 0 0 1 9.7-1.7A4 4 0 1 1 18 21H8a4 4 0 0 1-1-8"
            ></path>
          </svg>
        `;
    }
  }

  private iconType(code: number) {
    if (code === 0) return 'sun';
    if (code >= 1 && code <= 3) return 'partly';
    if (code === 45 || code === 48) return 'fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return 'rain';
    }
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return 'snow';
    }
    if (code >= 95) return 'storm';
    return 'cloud';
  }

  private renderSummary() {
    if (!this.data) return null;
    const { current } = this.data;
    const labels = this.resolvedLabels;
    return html`
      <div class="weather__summary" aria-live="polite">
        <span class="weather__icon">${this.iconFor(current.code)}</span>
        <div class="weather__summary-info">
          <span class="weather__temp"
            >${current.temp ?? '--'}${current.temp === null ? '' : '°C'}</span
          >
          <span class="weather__desc">${current.description}</span>
          <span class="weather__meta">
            ${labels.maxLabel} ${current.max ?? '--'}° / ${labels.minLabel}
            ${current.min ?? '--'}°
          </span>
          <span class="weather__meta">
            ${labels.updatedLabel} ${this.formatTime(current.time)}
          </span>
        </div>
      </div>
    `;
  }

  private renderCompact() {
    const labels = this.resolvedLabels;
    const title = this.heading || labels.compactHeading;
    const errorText =
      this.error === 'invalid'
        ? labels.invalidCoordinates
        : this.error === 'api'
          ? labels.apiError
          : '';
    return html`
      <div class="weather weather--compact">
        <div class="weather__header">
          <h2 class="weather__title">${title}</h2>
        </div>
        ${this.loading
          ? html`<span class="weather__status">${labels.loadingCompact}</span>`
          : null}
        ${this.error
          ? html`<span class="weather__error">${errorText}</span>`
          : null}
        ${this.data ? this.renderSummary() : null}
        ${this.linkUrl
          ? html`<a class="weather__link" href=${this.linkUrl}
              >${this.linkLabel ?? labels.linkLabel}</a
            >`
          : null}
      </div>
    `;
  }

  private renderFull() {
    const labels = this.resolvedLabels;
    const title = this.heading || labels.fullHeading;
    const errorText =
      this.error === 'invalid'
        ? labels.invalidCoordinates
        : this.error === 'api'
          ? labels.apiError
          : '';
    return html`
      <div class="weather">
        <div class="weather__header">
          <h2 class="weather__title">${title}</h2>
          <p class="weather__text">
            ${labels.fullDescription}
          </p>
        </div>
        <div class="weather__panel">
          ${this.loading
            ? html`<span class="weather__status">${labels.loadingFull}</span>`
            : null}
          ${this.error
            ? html`<span class="weather__error">${errorText}</span>`
            : null}
          ${this.data ? this.renderSummary() : null}
          ${this.data
            ? html`
                <div class="weather__grid">
                  ${this.data.days.slice(0, 7).map(
                    day => html`
                      <article class="weather__card">
                        <span class="weather__icon">${this.iconFor(day.code)}</span>
                        <span class="weather__day">${this.formatDay(day.time)}</span>
                        <span class="weather__date">${this.formatDate(day.time)}</span>
                        <span class="weather__temp"
                          >${day.max}° / ${day.min}°</span
                        >
                        <span class="weather__meta">${day.description}</span>
                      </article>
                    `
                  )}
                </div>
              `
            : null}
        </div>
        <span class="weather__footer">
          ${labels.sourceLabel}
          <a
            class="weather__source"
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            >${labels.sourceName}</a
          >
        </span>
      </div>
    `;
  }

  render() {
    return this.variant === 'compact' ? this.renderCompact() : this.renderFull();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pm-weather': PmWeather;
  }
}
