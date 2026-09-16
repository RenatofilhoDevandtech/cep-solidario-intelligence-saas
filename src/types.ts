export interface CepData {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  ibge?: string;
  ddd?: string;
  lat: number;
  lon: number;
  fonte: 'ViaCEP' | 'BrasilAPI' | 'AwesomeAPI' | 'Cache Local';
  responseTimeMs?: number;
  qualityScore: number; // 0-100
  deliveryProbability: number; // % taxa de entrega esperada
  riskLevel: 'baixo' | 'moderado' | 'atencao';
  riskDescription?: string;
  acessibilidadeScore: number; // 0-100 baseado na média comunitária
  totalAvaliacoes: number;
  localNome?: string;
}

export interface AcessibilidadeAvaliacao {
  id: string;
  cep: string;
  local_nome: string;
  usuario_nome: string;
  numero?: string;
  complemento?: string;
  logradouro?: string;
  rampa_acesso: boolean;
  elevador: boolean;
  banheiro_adaptado: boolean;
  vaga_pcd: boolean;
  piso_tatil: boolean;
  balcao_baixo: boolean;
  // Inclusão ampla para todas as deficiências:
  interprete_libras?: boolean; // Auditiva
  sinalizacao_sonora?: boolean; // Visual / Cegos
  espaco_calmo?: boolean; // Neurodivergência / TEA
  portas_largas?: boolean; // Mobilidade reduzida / Cadeiras motorizadas
  comentario: string;
  fotos: string[];
  nota_facilidade: number; // 1 to 5
  upvotes: number;
  created_at: string;
  lat?: number;
  lon?: number;
  cidade?: string;
  uf?: string;
  bairro?: string;
}

export interface AcessibilidadeStats {
  total: number;
  mediaNota: number;
  percentRampa: number;
  percentElevador: number;
  percentBanheiro: number;
  percentVagaPcd: number;
  percentPisoTatil: number;
  percentBalcaoBaixo: number;
  percentLibras?: number;
  percentSonoro?: number;
  percentNeurodivergente?: number;
}

export interface ApiKeyItem {
  id: string;
  key: string;
  name: string;
  plan: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE';
  rateLimit: number; // requisições/minuto
  requestsToday: number;
  requestsLimitToday: number;
  created_at: string;
  active: boolean;
}

export interface ApiRequestLog {
  id: string;
  apiKeyId: string;
  endpoint: string;
  cep: string;
  status: number;
  responseTimeMs: number;
  timestamp: string;
  source: string;
}

export interface BatchItemResult {
  cep: string;
  valid: boolean;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  qualityScore: number;
  riskLevel: string;
  acessibilidade: boolean;
  error?: string;
}

export interface PlanInfo {
  id: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE';
  name: string;
  price: string;
  priceValue: number;
  period: string;
  consultasMes: string;
  consultasDia: number;
  features: string[];
  recommended?: boolean;
  badge?: string;
}

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  cnpj?: string;
  plan: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE';
  createdAt: string;
}

export interface EstadoRanking {
  uf: string;
  total: number;
  mediaNota: number;
  percentAcessivel: number;
}

export interface MapaNacionalData {
  totalLocais: number;
  mediaNacional: number;
  rankingEstados: EstadoRanking[];
  locais: (AcessibilidadeAvaliacao & { scoreGeral: number })[];
}

export interface PessoaRecord {
  id: number;
  nome: string;
  cpf: string;
  cep: string;
  numero: string;
  complemento: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  rua: string;
  termo_lgpd: boolean;
  created_at: string;
}

export interface NewPessoaPayload {
  nome: string;
  cpf: string;
  cep: string;
  numero: string;
  complemento?: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  rua: string;
  termo_lgpd?: boolean;
}

export interface DockerStatus {
  status: string;
  services: {
    frontend: { container: string; port: number; type: string };
    backend: { container: string; port: number; type: string };
    database: {
      container: string;
      port: number;
      volume: string;
      mountPoint: string;
      isConnected: boolean;
      host: string;
      database: string;
      engine: string;
    };
  };
  network: string;
  timestamp: string;
}

