import {
  CepData,
  AcessibilidadeAvaliacao,
  AcessibilidadeStats,
  ApiKeyItem,
  ApiRequestLog,
  BatchItemResult,
  CompanyUser,
  MapaNacionalData,
  PessoaRecord,
  NewPessoaPayload,
  DockerStatus,
} from '../types.js';

export async function consultarCep(cep: string): Promise<CepData & { avaliacoes: AcessibilidadeAvaliacao[]; acessibilidadeStats: AcessibilidadeStats }> {
  const clean = cep.replace(/\D/g, '');
  const res = await fetch(`/api/cep/${clean}`);
  const text = await res.text().catch(() => '');
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // fallback non-json
  }

  if (!res.ok) {
    throw new Error(data.error || text || `Erro ao consultar CEP ${cep}`);
  }

  return {
    ...data,
    acessibilidadeStats: data.acessibilidade || {
      total: 0,
      mediaNota: 0,
      percentRampa: 0,
      percentElevador: 0,
      percentBanheiro: 0,
      percentVagaPcd: 0,
      percentPisoTatil: 0,
      percentBalcaoBaixo: 0,
    },
  };
}

export async function cadastrarAcessibilidade(payload: {
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
  interprete_libras?: boolean;
  sinalizacao_sonora?: boolean;
  espaco_calmo?: boolean;
  portas_largas?: boolean;
  comentario: string;
  fotos: string[];
  nota_facilidade: number;
}): Promise<AcessibilidadeAvaliacao> {
  const res = await fetch('/api/acessibilidade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => '');
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // fallback non-json
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Servidor ativo não encontrou a rota /api/acessibilidade (404). Reinicie o comando "npm run dev" no terminal para aplicar o backend atualizado.');
    }
    throw new Error(json.error || text || 'Erro ao cadastrar avaliação de acessibilidade');
  }

  return json.avaliacao;
}

export async function upvoteAvaliacaoApi(id: string): Promise<number> {
  const res = await fetch(`/api/acessibilidade/${id}/upvote`, {
    method: 'PUT',
  });
  if (!res.ok) {
    throw new Error('Falha ao confirmar acessibilidade');
  }
  const json = await res.json();
  return json.upvotes;
}

export async function buscarLocaisMapa(lat: number, lon: number, radius: number = 50): Promise<(AcessibilidadeAvaliacao & { distanceKm: number })[]> {
  const res = await fetch(`/api/mapa?lat=${lat}&lon=${lon}&radius=${radius}`);
  if (!res.ok) {
    throw new Error('Erro ao carregar mapa');
  }
  const json = await res.json();
  return json.locais || [];
}

export async function buscarMapaNacional(): Promise<MapaNacionalData> {
  const res = await fetch('/api/mapa/nacional');
  if (!res.ok) {
    throw new Error('Erro ao carregar base nacional de acessibilidade');
  }
  return res.json();
}

export async function buscarEstatisticasUso(): Promise<{
  totalRequestsToday: number;
  avgResponseTime: number;
  successRate: number;
  activeKeys: number;
  dailyUsage: { day: string; requests: number; validRate: number }[];
  recentLogs: ApiRequestLog[];
}> {
  const res = await fetch('/api/admin/usage');
  if (!res.ok) throw new Error('Erro ao buscar analytics de uso');
  return res.json();
}

export async function listarChavesApi(): Promise<ApiKeyItem[]> {
  const res = await fetch('/api/api-keys');
  if (!res.ok) throw new Error('Erro ao listar chaves');
  const json = await res.json();
  return json.keys;
}

export async function criarChaveApi(name: string, plan: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE'): Promise<ApiKeyItem> {
  const res = await fetch('/api/api-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, plan }),
  });
  if (!res.ok) throw new Error('Erro ao gerar chave de API');
  const json = await res.json();
  return json.key;
}

export async function revogarChaveApi(id: string): Promise<void> {
  const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao revogar chave');
}

export async function processarBatchApi(ceps: string[]): Promise<{
  total: number;
  validCount: number;
  invalidCount: number;
  overallScore: number;
  results: BatchItemResult[];
}> {
  const res = await fetch('/api/v1/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ceps }),
  });
  if (!res.ok) throw new Error('Erro ao processar lote de CEPs');
  return res.json();
}

export async function loginEmpresa(email: string, password: string): Promise<CompanyUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao realizar login corporativo.');
  }
  return data.company;
}

export async function logoutEmpresa(): Promise<void> {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) throw new Error('Não foi possível encerrar a sessão.');
}

export async function registrarEmpresa(payload: {
  name: string;
  email: string;
  password: string;
  cnpj?: string;
}): Promise<CompanyUser> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao cadastrar empresa.');
  }
  return data.company;
}

export async function atualizarPlanoEmpresa(plan: string): Promise<CompanyUser> {
  const res = await fetch('/api/auth/update-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao atualizar plano da empresa.');
  }
  return data.company;
}

export async function listarPessoas(): Promise<PessoaRecord[]> {
  const res = await fetch('/api/pessoas');
  const text = await res.text().catch(() => '');
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-json
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Endpoint /api/pessoas não encontrado (404). O servidor backend ativo precisa ser reiniciado no terminal (Ctrl+C e depois npm run dev) para reconhecer as novas rotas.');
    }
    throw new Error(json?.error || text || 'Erro ao listar pessoas cadastradas');
  }

  return Array.isArray(json) ? json : [];
}

export async function cadastrarPessoa(payload: NewPessoaPayload): Promise<PessoaRecord> {
  const res = await fetch('/api/pessoas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => '');
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // non-json response (e.g. 404 Cannot POST or HTML)
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Endpoint /api/pessoas não encontrado no servidor ativo (404). O processo "npm run dev" no terminal precisa ser reiniciado (pressione Ctrl+C e execute "npm run dev") para ativar as novas rotas do backend.');
    }
    throw new Error(data.error || text || `Erro ${res.status} ao cadastrar pessoa e endereço.`);
  }

  if (!data.pessoa) {
    throw new Error('A resposta do servidor não continha os dados da pessoa cadastrada.');
  }

  return data.pessoa;
}

export async function buscarStatusDocker(): Promise<DockerStatus> {
  const defaultFallback: DockerStatus = {
    status: 'online',
    services: {
      frontend: { container: 'cep_solidario_frontend', port: 3000, type: 'Nginx Reverse Proxy' },
      backend: { container: 'cep_solidario_backend', port: 5000, type: 'Node.js Express REST API' },
      database: {
        container: 'cep_solidario_mysql',
        port: 3306,
        volume: 'mysql_data',
        mountPoint: '/var/lib/mysql',
        isConnected: false,
        host: 'localhost',
        database: 'cepsolidario_db',
        engine: 'MySQL 8.0 (InnoDB)',
      },
    },
    network: 'cep_network (bridge)',
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/system/docker-status');
    if (!res.ok) {
      return defaultFallback;
    }
    return await res.json();
  } catch {
    return defaultFallback;
  }
}

