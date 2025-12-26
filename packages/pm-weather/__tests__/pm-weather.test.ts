import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchWeatherApi } from 'openmeteo';
import '../src/pm-weather';

vi.mock('openmeteo', () => ({
  fetchWeatherApi: vi.fn(),
}));

const fetchWeatherApiMock = vi.mocked(fetchWeatherApi);

const flush = () => new Promise(resolve => setTimeout(resolve));

const buildMockResponse = () => ({
  timezone: () => 'Europe/Madrid',
  current: () => ({
    time: () => 1700000000,
    variables: (index: number) => ({
      value: () => (index === 0 ? 18.4 : 1),
    }),
  }),
  daily: () => ({
    time: () => 1700000000,
    timeEnd: () => 1700000000 + 7 * 86400,
    interval: () => 86400,
    variables: (index: number) => ({
      valuesArray: () => {
        switch (index) {
          case 0:
            return [1, 2, 3, 45, 61, 71, 95];
          case 1:
            return [20, 21, 22, 23, 24, 25, 26];
          case 2:
            return [10, 11, 12, 13, 14, 15, 16];
          default:
            return [];
        }
      },
    }),
  }),
});

const createElement = () =>
  document.createElement('pm-weather') as HTMLElement & {
    updateComplete: Promise<unknown>;
    latitude?: number;
    longitude?: number;
    variant?: 'compact' | 'full';
    locale?: string;
  };

describe('PmWeather', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    fetchWeatherApiMock.mockReset();
  });

  it('muestra error con coordenadas no validas', async () => {
    const element = createElement();
    document.body.appendChild(element);

    await element.updateComplete;
    await flush();
    await element.updateComplete;

    expect(element.shadowRoot?.textContent).toContain('Invalid coordinates.');
  });

  it('renderiza datos cuando la API responde', async () => {
    fetchWeatherApiMock.mockResolvedValue([buildMockResponse()]);

    const element = createElement();
    element.latitude = 39.8210618;
    element.longitude = -2.3452935;
    document.body.appendChild(element);

    await flush();
    await element.updateComplete;
    await flush();
    await element.updateComplete;

    expect(fetchWeatherApiMock).toHaveBeenCalled();
    expect(element.shadowRoot?.textContent).toContain('Max');
    expect(element.shadowRoot?.textContent).toContain('Source:');
    expect(element.shadowRoot?.textContent).toContain('Open-Meteo');
  });

  it('usa cache cuando existe', async () => {
    const latitude = 39.8210618;
    const longitude = -2.3452935;

    const cachedData = {
      current: {
        temp: 22,
        code: 1,
        time: 1700000000 * 1000,
        max: 24,
        min: 12,
        description: 'Mostly clear',
      },
      days: [
        {
          time: 1700000000 * 1000,
          max: 24,
          min: 12,
          code: 1,
          description: 'Mostly clear',
        },
      ],
      timeZone: 'Europe/Madrid',
    };

    localStorage.setItem(
      `pm-weather:${latitude}:${longitude}`,
      JSON.stringify({
        data: cachedData,
        expiresAt: Date.now() + 100000,
      })
    );

    const element = createElement();
    element.latitude = latitude;
    element.longitude = longitude;
    document.body.appendChild(element);

    await flush();
    await element.updateComplete;

    expect(fetchWeatherApiMock).not.toHaveBeenCalled();
    expect(element.shadowRoot?.textContent).toContain('Mostly clear');
  });

  it('no muestra la fuente en compact y si en full', async () => {
    fetchWeatherApiMock.mockResolvedValue([buildMockResponse()]);

    const compact = createElement();
    compact.variant = 'compact';
    compact.latitude = 39.8210618;
    compact.longitude = -2.3452935;
    document.body.appendChild(compact);

    await flush();
    await compact.updateComplete;
    await flush();
    await compact.updateComplete;

    expect(compact.shadowRoot?.textContent).not.toContain('Source:');

    const full = createElement();
    full.variant = 'full';
    full.latitude = 39.8210618;
    full.longitude = -2.3452935;
    document.body.appendChild(full);

    await flush();
    await full.updateComplete;
    await flush();
    await full.updateComplete;

    expect(full.shadowRoot?.textContent).toContain('Source:');
    expect(full.shadowRoot?.textContent).toContain('Open-Meteo');
  });

  it('recarga al cambiar coordenadas', async () => {
    fetchWeatherApiMock.mockResolvedValue([buildMockResponse()]);

    const element = createElement();
    element.latitude = 39.8210618;
    element.longitude = -2.3452935;
    document.body.appendChild(element);

    await flush();
    await element.updateComplete;
    await flush();
    await element.updateComplete;

    fetchWeatherApiMock.mockClear();
    element.longitude = -2.346;
    await element.updateComplete;
    await flush();
    await element.updateComplete;

    expect(fetchWeatherApiMock).toHaveBeenCalledTimes(1);
  });

  it('ignora cache caducada y vuelve a pedir datos', async () => {
    fetchWeatherApiMock.mockResolvedValue([buildMockResponse()]);

    const latitude = 39.8210618;
    const longitude = -2.3452935;

    localStorage.setItem(
      `pm-weather:${latitude}:${longitude}`,
      JSON.stringify({
        data: {
          current: {
            temp: 22,
            code: 1,
            time: 1700000000 * 1000,
            max: 24,
            min: 12,
            description: 'Mostly clear',
          },
          days: [],
          timeZone: 'Europe/Madrid',
        },
        expiresAt: Date.now() - 1000,
      })
    );

    const element = createElement();
    element.latitude = latitude;
    element.longitude = longitude;
    document.body.appendChild(element);

    await flush();
    await element.updateComplete;
    await flush();
    await element.updateComplete;

    expect(fetchWeatherApiMock).toHaveBeenCalled();
  });

  it('muestra error cuando la API falla', async () => {
    fetchWeatherApiMock.mockRejectedValue(new Error('Network error'));

    const element = createElement();
    element.latitude = 39.8210618;
    element.longitude = -2.3452935;
    document.body.appendChild(element);

    await flush();
    await element.updateComplete;
    await flush();
    await element.updateComplete;

    expect(element.shadowRoot?.textContent).toContain('Unable to load weather.');
  });

  it('usa textos en español cuando locale es es-ES', async () => {
    fetchWeatherApiMock.mockResolvedValue([buildMockResponse()]);

    const element = createElement();
    element.locale = 'es-ES';
    element.latitude = 39.8210618;
    element.longitude = -2.3452935;
    document.body.appendChild(element);

    await flush();
    await element.updateComplete;
    await flush();
    await element.updateComplete;

    expect(element.shadowRoot?.textContent).toContain(
      'Previsión para los próximos 7 días'
    );
    expect(element.shadowRoot?.textContent).toContain(
      'Consulta el estado del tiempo previsto para planificar actividades y visitas con antelación.'
    );
    expect(element.shadowRoot?.textContent).toContain('Mayormente despejado');
    expect(element.shadowRoot?.textContent).toContain('Datos:');
  });
});
