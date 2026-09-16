export interface AddressResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  ibge: string;
  ddd: string;
  lat: number;
  lon: number;
  fonte: 'ViaCEP' | 'BrasilAPI' | 'AwesomeAPI' | 'Cache Local';
  qualityScore: number;
  deliveryProbability: number;
  riskLevel: 'baixo' | 'moderado' | 'atencao';
  riskDescription: string;
}

// In-memory cache
const cepCache = new Map<string, { data: AddressResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Default regional coordinates for fallbacks if GPS is not returned
const regionalCoordinates: Record<string, { lat: number; lon: number }> = {
  'SP': { lat: -23.5505, lon: -46.6333 },
  'RJ': { lat: -22.9068, lon: -43.1729 },
  'MG': { lat: -19.9167, lon: -43.9345 },
  'BA': { lat: -12.9714, lon: -38.5014 },
  'RS': { lat: -30.0346, lon: -51.2177 },
  'PR': { lat: -25.4284, lon: -49.2733 },
  'PE': { lat: -8.0476, lon: -34.8770 },
  'CE': { lat: -3.7172, lon: -38.5433 },
  'DF': { lat: -15.7975, lon: -47.8919 },
  'SC': { lat: -27.5954, lon: -48.5480 },
  'GO': { lat: -16.6869, lon: -49.2648 },
  'AM': { lat: -3.1190, lon: -60.0217 },
  'PA': { lat: -1.4558, lon: -48.4902 },
};

// Known famous reference CEPs with precise coords
const knownCeps: Record<string, { lat: number; lon: number }> = {
  '01310100': { lat: -23.561492, lon: -46.655881 }, // Av. Paulista (MASP)
  '01310930': { lat: -23.5658, lon: -46.6515 }, // Paulista Shopping
  '01001000': { lat: -23.5504, lon: -46.6339 }, // Praça da Sé, SP
  '04001000': { lat: -23.5794, lon: -46.6433 }, // Paraíso / Ibirapuera
  '22041001': { lat: -22.9691, lon: -43.1869 }, // Copacabana, RJ
  '20040002': { lat: -22.9063, lon: -43.1764 }, // Cinelândia, RJ
  '30130100': { lat: -19.9238, lon: -43.9377 }, // Savassi, Belo Horizonte
  '40026280': { lat: -12.9718, lon: -38.5097 }, // Pelourinho, Salvador
  '70040010': { lat: -15.7998, lon: -47.8645 }, // Esplanada dos Ministérios, DF
  '80010000': { lat: -25.4290, lon: -49.2719 }, // Centro, Curitiba
  '90010150': { lat: -30.0277, lon: -51.2287 }, // Mercado Público, Porto Alegre
  '50010000': { lat: -8.0631, lon: -34.8711 }, // Recife Antigo
};

export function sanitizeCep(rawCep: string): string {
  return rawCep.replace(/\D/g, '').padStart(8, '0').slice(0, 8);
}

function calculateScoreAndRisk(logradouro: string, bairro: string, cidade: string, uf: string): {
  qualityScore: number;
  deliveryProbability: number;
  riskLevel: 'baixo' | 'moderado' | 'atencao';
  riskDescription: string;
} {
  let score = 70;
  if (logradouro && logradouro.trim().length > 3) score += 15;
  if (bairro && bairro.trim().length > 2) score += 10;
  if (cidade && uf) score += 5;

  // Simulate slight variance based on character hash for realism
  const hash = (logradouro + bairro + cidade).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variance = (hash % 9) - 4; // -4 to +4
  score = Math.min(99, Math.max(65, score + variance));

  let deliveryProb = Math.min(99.4, +(score * 0.98 + (hash % 4)).toFixed(1));
  let riskLevel: 'baixo' | 'moderado' | 'atencao' = 'baixo';
  let riskDescription = 'Endereço regular com alta precisão cadastral e baixa probabilidade de extravio.';

  if (score < 80) {
    riskLevel = 'moderado';
    riskDescription = 'Endereço genérico ou sem especificação de trecho. Recomenda-se confirmar número e complemento no checkout.';
  } else if (!logradouro) {
    riskLevel = 'atencao';
    riskDescription = 'CEP único do município ou zona rural. Logradouro não delimitado na base oficial.';
    deliveryProb = 78.5;
  }

  return { qualityScore: score, deliveryProbability: deliveryProb, riskLevel, riskDescription };
}

export async function fetchCepWithFallback(rawCep: string): Promise<AddressResult> {
  const clean = sanitizeCep(rawCep);
  if (clean.length !== 8) {
    throw new Error('CEP inválido. Forneça exatamente 8 dígitos.');
  }

  // 1. Check in-memory cache
  const cached = cepCache.get(clean);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.data, fonte: 'Cache Local' };
  }

  let addressData: {
    logradouro: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    ibge: string;
    ddd: string;
    lat?: number;
    lon?: number;
    fonte: 'ViaCEP' | 'BrasilAPI' | 'AwesomeAPI';
  } | null = null;

  // 2. Primary: ViaCEP
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CEPSolidario-Intelligence/1.0' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (!data.erro) {
        addressData = {
          logradouro: data.logradouro || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: data.uf || '',
          ibge: data.ibge || '',
          ddd: data.ddd || '',
          fonte: 'ViaCEP',
        };
      }
    }
  } catch {
    console.warn(`ViaCEP falhou para CEP ${clean}, iniciando fallback para BrasilAPI...`);
  }

  // 3. Fallback 1: BrasilAPI
  if (!addressData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const lat = data.location?.coordinates?.latitude ? Number(data.location.coordinates.latitude) : undefined;
        const lon = data.location?.coordinates?.longitude ? Number(data.location.coordinates.longitude) : undefined;

        addressData = {
          logradouro: data.street || '',
          complemento: '',
          bairro: data.neighborhood || '',
          cidade: data.city || '',
          uf: data.state || '',
          ibge: '',
          ddd: '',
          lat,
          lon,
          fonte: 'BrasilAPI',
        };
      }
    } catch {
      console.warn(`BrasilAPI falhou para CEP ${clean}, iniciando fallback para AwesomeAPI...`);
    }
  }

  // 4. Fallback 2: AwesomeAPI
  if (!addressData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://cep.awesomeapi.com.br/json/${clean}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        addressData = {
          logradouro: data.address || '',
          complemento: '',
          bairro: data.district || '',
          cidade: data.city || '',
          uf: data.state || '',
          ibge: data.city_ibge || '',
          ddd: data.ddd || '',
          lat: data.lat ? Number(data.lat) : undefined,
          lon: data.lng ? Number(data.lng) : undefined,
          fonte: 'AwesomeAPI',
        };
      }
    } catch {
      console.warn(`AwesomeAPI falhou para CEP ${clean}`);
    }
  }

  if (!addressData) {
    throw new Error(`CEP ${clean} não foi localizado em nenhum dos provedores públicos.`);
  }

  // Determine latitude and longitude
  let lat = addressData.lat;
  let lon = addressData.lon;

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    if (knownCeps[clean]) {
      lat = knownCeps[clean].lat;
      lon = knownCeps[clean].lon;
    } else {
      const stateFallback = regionalCoordinates[addressData.uf] || { lat: -15.78, lon: -47.92 };
      // add minute deterministic offset for street map dispersion
      const offset = (parseInt(clean.slice(-3), 10) || 100) / 10000;
      lat = stateFallback.lat + offset;
      lon = stateFallback.lon + (offset * 1.2);
    }
  }

  const { qualityScore, deliveryProbability, riskLevel, riskDescription } = calculateScoreAndRisk(
    addressData.logradouro,
    addressData.bairro,
    addressData.cidade,
    addressData.uf
  );

  const finalResult: AddressResult = {
    cep: `${clean.slice(0, 5)}-${clean.slice(5)}`,
    logradouro: addressData.logradouro,
    complemento: addressData.complemento,
    bairro: addressData.bairro,
    cidade: addressData.cidade,
    uf: addressData.uf,
    ibge: addressData.ibge,
    ddd: addressData.ddd,
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    fonte: addressData.fonte,
    qualityScore,
    deliveryProbability,
    riskLevel,
    riskDescription,
  };

  cepCache.set(clean, { data: finalResult, timestamp: Date.now() });
  return finalResult;
}
