export interface AvaliacaoRecord {
  id: string;
  cep: string;
  local_nome: string;
  usuario_nome: string;
  rampa_acesso: boolean;
  elevador: boolean;
  banheiro_adaptado: boolean;
  vaga_pcd: boolean;
  piso_tatil: boolean;
  balcao_baixo: boolean;
  interprete_libras?: boolean;
  sinalizacao_sonora?: boolean;
  espaco_calmo?: boolean;
  portas_largas?: boolean;
  comentario: string;
  fotos: string[];
  nota_facilidade: number; // 1 to 5
  upvotes: number;
  created_at: string;
  lat: number;
  lon: number;
  cidade: string;
  uf: string;
  bairro: string;
}

// Initial realistic database seed
const avaliacoesDb: AvaliacaoRecord[] = [
  {
    id: 'av-1',
    cep: '01310-100',
    local_nome: 'MASP - Museu de Arte de São Paulo',
    usuario_nome: 'Mariana Lima (Cadeirante)',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: true,
    interprete_libras: true,
    sinalizacao_sonora: true,
    espaco_calmo: true,
    portas_largas: true,
    comentario: 'Acesso exemplar por elevadores panorâmicos, banheiros totalmente acessíveis no subsolo, audioguias, mediadores em Libras e piso tátil contínuo.',
    fotos: [
      'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=600&auto=format&fit=crop&q=80'
    ],
    nota_facilidade: 5,
    upvotes: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    lat: -23.561492,
    lon: -46.655881,
    cidade: 'São Paulo',
    uf: 'SP',
    bairro: 'Bela Vista',
  },
  {
    id: 'av-2',
    cep: '01310-930',
    local_nome: 'Shopping Center 3 & Estação Consolação',
    usuario_nome: 'Carlos Eduardo (Guia Cão-Guia)',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: false,
    interprete_libras: false,
    sinalizacao_sonora: true,
    espaco_calmo: false,
    portas_largas: true,
    comentario: 'Piso tátil bem demarcado conectando a calçada da Paulista ao saguão. Elevadores com aviso sonoro e braille nos botões.',
    fotos: [],
    nota_facilidade: 4,
    upvotes: 28,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    lat: -23.5598,
    lon: -46.6601,
    cidade: 'São Paulo',
    uf: 'SP',
    bairro: 'Cerqueira César',
  },
  {
    id: 'av-3',
    cep: '01001-000',
    local_nome: 'Poupatempo Sé / Estação Sé',
    usuario_nome: 'Ana Beatriz Souza',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: false,
    piso_tatil: true,
    balcao_baixo: true,
    interprete_libras: true,
    sinalizacao_sonora: true,
    espaco_calmo: true,
    portas_largas: true,
    comentario: 'Atendimento prioritário exemplar. Balcão rebaixado para cadeirantes, intérprete de Libras presencial e sala sensorial com iluminação suave para pessoas com autismo.',
    fotos: [],
    nota_facilidade: 5,
    upvotes: 35,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    lat: -23.5504,
    lon: -46.6339,
    cidade: 'São Paulo',
    uf: 'SP',
    bairro: 'Sé',
  },
  {
    id: 'av-4',
    cep: '22041-001',
    local_nome: 'Clínica & Centro Comercial Copacabana',
    usuario_nome: 'Roberto Silveira',
    rampa_acesso: true,
    elevador: false,
    banheiro_adaptado: true,
    vaga_pcd: false,
    piso_tatil: false,
    balcao_baixo: false,
    comentario: 'Rampa de acesso suave na portaria, porém elevador estava temporariamente em manutenção no dia.',
    fotos: [],
    nota_facilidade: 3,
    upvotes: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    lat: -22.9691,
    lon: -43.1869,
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    bairro: 'Copacabana',
  },
  {
    id: 'av-5',
    cep: '30130-100',
    local_nome: 'Centro Cultural Banco do Brasil BH (Praça da Liberdade)',
    usuario_nome: 'Fernanda Martins',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: true,
    comentario: 'Espaço 100% adaptado com rampas históricas integradas, plataformas de elevação e audioguias para pessoas cegas.',
    fotos: [
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&auto=format&fit=crop&q=80'
    ],
    nota_facilidade: 5,
    upvotes: 56,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    lat: -19.9325,
    lon: -43.9372,
    cidade: 'Belo Horizonte',
    uf: 'MG',
    bairro: 'Funcionários',
  },
  {
    id: 'av-6',
    cep: '40026-280',
    local_nome: 'Largo do Pelourinho & Centro de Apoio ao Turista',
    usuario_nome: 'Lucas Bahia',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: false,
    piso_tatil: false,
    balcao_baixo: true,
    comentario: 'O centro de atendimento possui rampas modernas no acesso lateral e sanitário adaptado com barras de apoio.',
    fotos: [],
    nota_facilidade: 4,
    upvotes: 19,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    lat: -12.9718,
    lon: -38.5108,
    cidade: 'Salvador',
    uf: 'BA',
    bairro: 'Pelourinho',
  },
  {
    id: 'av-7',
    cep: '70040-010',
    local_nome: 'Biblioteca Nacional de Brasília & Complexo Cultural',
    usuario_nome: 'Thiago Alencar',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: true,
    interprete_libras: true,
    sinalizacao_sonora: true,
    espaco_calmo: true,
    portas_largas: true,
    comentario: 'Acessibilidade total. Elevadores adaptados, acervo em Braille, computadores com leitor de tela e mediadores fluentes em Libras.',
    fotos: [],
    nota_facilidade: 5,
    upvotes: 49,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    lat: -15.7975,
    lon: -47.8869,
    cidade: 'Brasília',
    uf: 'DF',
    bairro: 'Zona Cívico-Administrativa',
  },
  {
    id: 'av-8',
    cep: '80010-000',
    local_nome: 'Rua das Flores (Boca Maldita) & Bondinho da Leitura',
    usuario_nome: 'Camila Rossi',
    rampa_acesso: true,
    elevador: false,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: true,
    interprete_libras: false,
    sinalizacao_sonora: true,
    espaco_calmo: false,
    portas_largas: true,
    comentario: 'Calçadão totalmente plano com piso podotátil contínuo em toda a extensão e travessias com semáforo sonoro.',
    fotos: [],
    nota_facilidade: 5,
    upvotes: 62,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    lat: -25.4309,
    lon: -49.2733,
    cidade: 'Curitiba',
    uf: 'PR',
    bairro: 'Centro',
  },
  {
    id: 'av-9',
    cep: '90010-001',
    local_nome: 'Mercado Público de Porto Alegre',
    usuario_nome: 'Patrícia Duarte',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: false,
    interprete_libras: false,
    sinalizacao_sonora: false,
    espaco_calmo: false,
    portas_largas: true,
    comentario: 'Corredores amplos restaurados, rampas de acesso nos quatro quadrantes e banheiros adaptados com chave na portaria.',
    fotos: [],
    nota_facilidade: 4,
    upvotes: 38,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    lat: -30.0277,
    lon: -51.2287,
    cidade: 'Porto Alegre',
    uf: 'RS',
    bairro: 'Centro Histórico',
  },
  {
    id: 'av-10',
    cep: '60060-000',
    local_nome: 'Centro Dragão do Mar de Arte e Cultura',
    usuario_nome: 'Marcos Vinicius',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: true,
    interprete_libras: true,
    sinalizacao_sonora: true,
    espaco_calmo: true,
    portas_largas: true,
    comentario: 'Passarelas elevadas acessíveis conectando os museus ao planetário. Intérpretes de Libras em exposições e peças teatrais.',
    fotos: [],
    nota_facilidade: 5,
    upvotes: 51,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    lat: -3.7212,
    lon: -38.5204,
    cidade: 'Fortaleza',
    uf: 'CE',
    bairro: 'Praia de Iracema',
  },
  {
    id: 'av-11',
    cep: '69005-010',
    local_nome: 'Teatro Amazonas & Largo de São Sebastião',
    usuario_nome: 'Larissa Albuquerque',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: false,
    balcao_baixo: true,
    interprete_libras: true,
    sinalizacao_sonora: false,
    espaco_calmo: false,
    portas_largas: true,
    comentario: 'Plataforma elevatória acessível na entrada lateral, visitas guiadas com audiodescrição e banheiros adaptados.',
    fotos: [],
    nota_facilidade: 4,
    upvotes: 33,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    lat: -3.1302,
    lon: -60.0234,
    cidade: 'Manaus',
    uf: 'AM',
    bairro: 'Centro',
  },
  {
    id: 'av-12',
    cep: '50030-000',
    local_nome: 'Cais do Sertão & Marco Zero',
    usuario_nome: 'Rodrigo Freire',
    rampa_acesso: true,
    elevador: true,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: true,
    interprete_libras: true,
    sinalizacao_sonora: true,
    espaco_calmo: true,
    portas_largas: true,
    comentario: 'Museu 100% interativo com piso tátil integral, recursos táteis para cegos, audiodescrição em todas as salas e rampa de nível zero.',
    fotos: [],
    nota_facilidade: 5,
    upvotes: 45,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    lat: -8.0617,
    lon: -34.8711,
    cidade: 'Recife',
    uf: 'PE',
    bairro: 'Recife Antigo',
  },
  {
    id: 'av-13',
    cep: '88010-000',
    local_nome: 'Ponte Hercílio Luz & Mirante',
    usuario_nome: 'Juliana Castro',
    rampa_acesso: true,
    elevador: false,
    banheiro_adaptado: true,
    vaga_pcd: true,
    piso_tatil: true,
    balcao_baixo: false,
    interprete_libras: false,
    sinalizacao_sonora: true,
    espaco_calmo: false,
    portas_largas: true,
    comentario: 'Passarela para pedestres totalmente plana com piso tátil, mirante acessível e guarda-corpo seguro.',
    fotos: [],
    nota_facilidade: 5,
    upvotes: 27,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
    lat: -27.5935,
    lon: -48.5658,
    cidade: 'Florianópolis',
    uf: 'SC',
    bairro: 'Centro',
  }
];

// Haversine formula to compute distance in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getAllAvaliacoes(): AvaliacaoRecord[] {
  return [...avaliacoesDb].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getAvaliacoesByCep(rawCep: string): {
  cep: string;
  avaliacoes: AvaliacaoRecord[];
  stats: {
    total: number;
    mediaNota: number;
    percentRampa: number;
    percentElevador: number;
    percentBanheiro: number;
    percentVagaPcd: number;
    percentPisoTatil: number;
    percentBalcaoBaixo: number;
    percentLibras: number;
    percentSonoro: number;
    percentNeurodivergente: number;
  };
} {
  const clean = rawCep.replace(/\D/g, '');
  const formatted = `${clean.slice(0, 5)}-${clean.slice(5)}`;

  const items = avaliacoesDb.filter(
    (a) => a.cep.replace(/\D/g, '') === clean || a.cep === formatted || a.cep.startsWith(clean.slice(0, 5))
  );

  const total = items.length;
  if (total === 0) {
    return {
      cep: formatted,
      avaliacoes: [],
      stats: {
        total: 0,
        mediaNota: 0,
        percentRampa: 0,
        percentElevador: 0,
        percentBanheiro: 0,
        percentVagaPcd: 0,
        percentPisoTatil: 0,
        percentBalcaoBaixo: 0,
        percentLibras: 0,
        percentSonoro: 0,
        percentNeurodivergente: 0,
      },
    };
  }

  const mediaNota = +(items.reduce((acc, curr) => acc + curr.nota_facilidade, 0) / total).toFixed(1);
  const countRampa = items.filter((i) => i.rampa_acesso).length;
  const countElevador = items.filter((i) => i.elevador).length;
  const countBanheiro = items.filter((i) => i.banheiro_adaptado).length;
  const countVaga = items.filter((i) => i.vaga_pcd).length;
  const countPiso = items.filter((i) => i.piso_tatil).length;
  const countBalcao = items.filter((i) => i.balcao_baixo).length;
  const countLibras = items.filter((i) => i.interprete_libras).length;
  const countSonoro = items.filter((i) => i.sinalizacao_sonora).length;
  const countNeuro = items.filter((i) => i.espaco_calmo).length;

  return {
    cep: formatted,
    avaliacoes: items,
    stats: {
      total,
      mediaNota,
      percentRampa: Math.round((countRampa / total) * 100),
      percentElevador: Math.round((countElevador / total) * 100),
      percentBanheiro: Math.round((countBanheiro / total) * 100),
      percentVagaPcd: Math.round((countVaga / total) * 100),
      percentPisoTatil: Math.round((countPiso / total) * 100),
      percentBalcaoBaixo: Math.round((countBalcao / total) * 100),
      percentLibras: Math.round((countLibras / total) * 100),
      percentSonoro: Math.round((countSonoro / total) * 100),
      percentNeurodivergente: Math.round((countNeuro / total) * 100),
    },
  };
}

export function createAvaliacao(data: {
  cep: string;
  local_nome: string;
  usuario_nome: string;
  rampa_acesso: boolean;
  elevador: boolean;
  banheiro_adaptado: boolean;
  vaga_pcd: boolean;
  piso_tatil: boolean;
  balcao_baixo: boolean;
  interprete_libras?: boolean;
  sinalizacao_sonora?: boolean;
  espaco_calmo?: boolean;
  portas_largas?: boolean;
  comentario: string;
  fotos?: string[];
  nota_facilidade: number;
  lat?: number;
  lon?: number;
  cidade?: string;
  uf?: string;
  bairro?: string;
}): AvaliacaoRecord {
  const clean = data.cep.replace(/\D/g, '');
  const formattedCep = `${clean.slice(0, 5)}-${clean.slice(5)}`;

  const newRecord: AvaliacaoRecord = {
    id: `av-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    cep: formattedCep,
    local_nome: data.local_nome?.trim() || 'Estabelecimento / Logradouro',
    usuario_nome: data.usuario_nome?.trim() || 'Colaborador Solidário',
    rampa_acesso: Boolean(data.rampa_acesso),
    elevador: Boolean(data.elevador),
    banheiro_adaptado: Boolean(data.banheiro_adaptado),
    vaga_pcd: Boolean(data.vaga_pcd),
    piso_tatil: Boolean(data.piso_tatil),
    balcao_baixo: Boolean(data.balcao_baixo),
    interprete_libras: Boolean(data.interprete_libras),
    sinalizacao_sonora: Boolean(data.sinalizacao_sonora),
    espaco_calmo: Boolean(data.espaco_calmo),
    portas_largas: Boolean(data.portas_largas),
    comentario: data.comentario?.trim() || 'Avaliação de acessibilidade registrada.',
    fotos: data.fotos || [],
    nota_facilidade: Math.min(5, Math.max(1, Number(data.nota_facilidade) || 5)),
    upvotes: 1, // Start with 1 confirmation
    created_at: new Date().toISOString(),
    lat: data.lat || -23.5505,
    lon: data.lon || -46.6333,
    cidade: data.cidade || 'São Paulo',
    uf: data.uf || 'SP',
    bairro: data.bairro || 'Centro',
  };

  avaliacoesDb.unshift(newRecord);
  return newRecord;
}

export function upvoteAvaliacao(id: string): { success: boolean; upvotes: number } {
  const item = avaliacoesDb.find((a) => a.id === id);
  if (!item) {
    return { success: false, upvotes: 0 };
  }
  item.upvotes += 1;
  return { success: true, upvotes: item.upvotes };
}

export function getLocaisProximos(lat: number, lon: number, radiusKm: number = 25): (AvaliacaoRecord & { distanceKm: number })[] {
  return avaliacoesDb
    .map((item) => {
      const dist = getDistanceFromLatLonInKm(lat, lon, item.lat, item.lon);
      return { ...item, distanceKm: Number(dist.toFixed(2)) };
    })
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getMapaNacional(): {
  totalLocais: number;
  mediaNacional: number;
  rankingEstados: { uf: string; total: number; mediaNota: number; percentAcessivel: number }[];
  locais: (AvaliacaoRecord & { scoreGeral: number })[];
} {
  const locaisComScore = avaliacoesDb.map((l) => {
    let score = l.nota_facilidade * 20; // 20 a 100
    return {
      ...l,
      scoreGeral: score,
    };
  });

  // Agrupar por Estado (UF)
  const ufMap: Record<string, { total: number; somaNotas: number; comRampaOuElevador: number }> = {};
  locaisComScore.forEach((item) => {
    const uf = item.uf.toUpperCase();
    if (!ufMap[uf]) {
      ufMap[uf] = { total: 0, somaNotas: 0, comRampaOuElevador: 0 };
    }
    ufMap[uf].total += 1;
    ufMap[uf].somaNotas += item.nota_facilidade;
    if (item.rampa_acesso || item.elevador) {
      ufMap[uf].comRampaOuElevador += 1;
    }
  });

  const rankingEstados = Object.entries(ufMap)
    .map(([uf, data]) => ({
      uf,
      total: data.total,
      mediaNota: Number((data.somaNotas / data.total).toFixed(1)),
      percentAcessivel: Math.round((data.comRampaOuElevador / data.total) * 100),
    }))
    .sort((a, b) => b.total - a.total || b.mediaNota - a.mediaNota);

  const mediaNacional =
    locaisComScore.length > 0
      ? Number((locaisComScore.reduce((acc, c) => acc + c.nota_facilidade, 0) / locaisComScore.length).toFixed(1))
      : 0;

  return {
    totalLocais: locaisComScore.length,
    mediaNacional,
    rankingEstados,
    locais: locaisComScore,
  };
}

export function exportAvaliacoesCsv(): string {
  const headers = [
    'ID',
    'CEP',
    'Local',
    'Usuario',
    'Nota',
    'Rampa',
    'Elevador',
    'Banheiro Adaptado',
    'Vaga PCD',
    'Piso Tatil',
    'Balcao Baixo',
    'Upvotes',
    'Cidade',
    'UF',
    'Data Cadastro',
    'Comentario',
  ];

  const rows = avaliacoesDb.map((item) => [
    item.id,
    item.cep,
    `"${(item.local_nome || '').replace(/"/g, '""')}"`,
    `"${(item.usuario_nome || '').replace(/"/g, '""')}"`,
    item.nota_facilidade,
    item.rampa_acesso ? 'SIM' : 'NAO',
    item.elevador ? 'SIM' : 'NAO',
    item.banheiro_adaptado ? 'SIM' : 'NAO',
    item.vaga_pcd ? 'SIM' : 'NAO',
    item.piso_tatil ? 'SIM' : 'NAO',
    item.balcao_baixo ? 'SIM' : 'NAO',
    item.upvotes,
    item.cidade,
    item.uf,
    item.created_at,
    `"${(item.comentario || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
