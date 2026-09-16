import { fetchCepWithFallback, sanitizeCep } from './cepService.js';
import { getAvaliacoesByCep } from './acessibilidadeService.js';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export interface ApiKeyItem {
  id: string;
  key: string;
  name: string;
  plan: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE';
  rateLimit: number; // req/min
  requestsToday: number;
  requestsLimitToday: number;
  created_at: string;
  active: boolean;
  companyId?: string;
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

// In-memory keys repository
const apiKeys: ApiKeyItem[] = [
  {
    id: 'key-dev-demo',
    key: 'cs_live_9b4e8721fa09cd3491e',
    name: 'E-commerce Checkout Principal (Produção)',
    plan: 'BUSINESS',
    rateLimit: 300,
    requestsToday: 2841,
    requestsLimitToday: 10000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    active: true,
    companyId: 'comp-1',
  },
  {
    id: 'key-test-env',
    key: 'cs_test_881fa430bce77192aa1',
    name: 'Ambiente de Homologação / Staging',
    plan: 'FREE',
    rateLimit: 60,
    requestsToday: 42,
    requestsLimitToday: 100,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    active: true,
    companyId: 'comp-2',
  },
];

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  cnpj?: string;
  plan: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE';
  createdAt: string;
}

const sessions = new Map<string, { companyId: string; expiresAt: number }>();
const requestWindows = new Map<string, { startedAt: number; count: number }>();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [, salt, expected] = storedHash.split(':');
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function createCompanySession(companyId: string): string {
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, { companyId, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}

export function getCompanyBySession(token: string | undefined): CompanyUser | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  const company = companies.find((item) => item.id === session.companyId);
  if (!company) return null;
  return {
    id: company.id,
    name: company.name,
    email: company.email,
    cnpj: company.cnpj,
    plan: company.plan,
    createdAt: company.createdAt,
  };
}

export function destroyCompanySession(token: string | undefined): void {
  if (token) sessions.delete(token);
}

// In-memory companies database with a pre-configured demo account
const companies: (CompanyUser & { passwordHash: string })[] = [
  {
    id: 'comp-1',
    name: 'Logística Express Brasil',
    email: 'contato@logisticaexpress.com.br',
    cnpj: '12.345.678/0001-90',
    plan: 'BUSINESS',
    passwordHash: hashPassword('123456'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  },
  {
    id: 'comp-2',
    name: 'Loja Virtual Exemplo',
    email: 'dev@lojaexemplo.com.br',
    cnpj: '98.765.432/0001-10',
    plan: 'STARTUP',
    passwordHash: hashPassword('123456'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

export function registerCompany(name: string, email: string, password: string, cnpj?: string): CompanyUser {
  const existing = companies.find((c) => c.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    throw new Error('Já existe uma empresa cadastrada com este e-mail corporativo.');
  }

  const newComp = {
    id: `comp-${Date.now()}`,
    name: name.trim() || 'Empresa Cadastrada',
    email: email.toLowerCase().trim(),
    cnpj: cnpj ? cnpj.trim() : undefined,
    plan: 'FREE' as const,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  companies.push(newComp);

  // Automatically provision their first FREE API Key
  createApiKey('Chave Padrão (Ambiente Inicial)', 'FREE', newComp.id);

  return {
    id: newComp.id,
    name: newComp.name,
    email: newComp.email,
    cnpj: newComp.cnpj,
    plan: newComp.plan,
    createdAt: newComp.createdAt,
  };
}

export function authenticateCompany(email: string, password: string): CompanyUser {
  const comp = companies.find(
    (c) => c.email.toLowerCase() === email.toLowerCase().trim() && verifyPassword(password, c.passwordHash)
  );
  if (!comp) {
    throw new Error('E-mail corporativo ou senha incorretos.');
  }

  return {
    id: comp.id,
    name: comp.name,
    email: comp.email,
    cnpj: comp.cnpj,
    plan: comp.plan,
    createdAt: comp.createdAt,
  };
}

export function updateCompanyPlan(email: string, plan: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE'): CompanyUser {
  const comp = companies.find((c) => c.email.toLowerCase() === email.toLowerCase().trim());
  if (!comp) {
    throw new Error('Empresa não encontrada.');
  }
  comp.plan = plan;
  return {
    id: comp.id,
    name: comp.name,
    email: comp.email,
    cnpj: comp.cnpj,
    plan: comp.plan,
    createdAt: comp.createdAt,
  };
}

export function updateCompanyPlanById(companyId: string, plan: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE'): CompanyUser {
  const comp = companies.find((c) => c.id === companyId);
  if (!comp) throw new Error('Empresa não encontrada.');
  comp.plan = plan;
  return {
    id: comp.id,
    name: comp.name,
    email: comp.email,
    cnpj: comp.cnpj,
    plan: comp.plan,
    createdAt: comp.createdAt,
  };
}

// In-memory request logs for analytics
const requestLogs: ApiRequestLog[] = [
  {
    id: 'log-1',
    apiKeyId: 'key-dev-demo',
    endpoint: '/api/v1/validate',
    cep: '01310-100',
    status: 200,
    responseTimeMs: 38,
    timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
    source: 'ViaCEP',
  },
  {
    id: 'log-2',
    apiKeyId: 'key-dev-demo',
    endpoint: '/api/v1/validate',
    cep: '22041-001',
    status: 200,
    responseTimeMs: 44,
    timestamp: new Date(Date.now() - 1000 * 75).toISOString(),
    source: 'Cache Local',
  },
  {
    id: 'log-3',
    apiKeyId: 'key-dev-demo',
    endpoint: '/api/v1/validate',
    cep: '70040-010',
    status: 200,
    responseTimeMs: 52,
    timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
    source: 'BrasilAPI',
  },
  {
    id: 'log-4',
    apiKeyId: 'key-test-env',
    endpoint: '/api/v1/validate',
    cep: '90010-150',
    status: 200,
    responseTimeMs: 35,
    timestamp: new Date(Date.now() - 1000 * 210).toISOString(),
    source: 'Cache Local',
  },
];

export function listApiKeys(companyId?: string): ApiKeyItem[] {
  return [...apiKeys].filter((item) => !companyId || item.companyId === companyId);
}

export function createApiKey(
  name: string,
  plan: 'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE',
  companyId?: string
): ApiKeyItem {
  const prefix = plan === 'FREE' ? 'cs_test_' : 'cs_live_';
  const randomHex = randomBytes(20).toString('hex');
  const key = `${prefix}${randomHex}`;

  const limits: Record<string, { rate: number; daily: number }> = {
    FREE: { rate: 60, daily: 100 },
    STARTUP: { rate: 120, daily: 1000 },
    BUSINESS: { rate: 300, daily: 10000 },
    ENTERPRISE: { rate: 1200, daily: 50000 },
  };

  const newKey: ApiKeyItem = {
    id: `key-${Date.now()}`,
    key,
    name: name.trim() || `API Key ${plan}`,
    plan,
    rateLimit: limits[plan].rate,
    requestsToday: 0,
    requestsLimitToday: limits[plan].daily,
    created_at: new Date().toISOString(),
    active: true,
    companyId,
  };

  apiKeys.unshift(newKey);
  return newKey;
}

export function revokeApiKey(id: string, companyId?: string): boolean {
  const idx = apiKeys.findIndex((k) => k.id === id && (!companyId || k.companyId === companyId));
  if (idx !== -1) {
    apiKeys.splice(idx, 1);
    return true;
  }
  return false;
}

export function logRequest(apiKeyId: string, endpoint: string, cep: string, status: number, responseTimeMs: number, source: string) {
  const log: ApiRequestLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    apiKeyId,
    endpoint,
    cep,
    status,
    responseTimeMs,
    timestamp: new Date().toISOString(),
    source,
  };

  requestLogs.unshift(log);
  if (requestLogs.length > 500) {
    requestLogs.pop();
  }

  // Increment key usage
  const key = apiKeys.find((k) => k.id === apiKeyId || k.key === apiKeyId);
  if (key) {
    key.requestsToday += 1;
  }
}

export function authenticateApiKey(rawKey: string | undefined): ApiKeyItem | null {
  if (!rawKey) return null;
  const key = apiKeys.find((item) => item.key === rawKey && item.active);
  if (!key) return null;

  const now = Date.now();
  const window = requestWindows.get(key.key);
  if (!window || now - window.startedAt >= 60_000) {
    requestWindows.set(key.key, { startedAt: now, count: 1 });
  } else if (window.count >= key.rateLimit) {
    return null;
  } else {
    window.count += 1;
  }

  if (key.requestsToday >= key.requestsLimitToday) return null;
  return key;
}

export function getUsageStats() {
  const totalRequestsToday = apiKeys.reduce((acc, k) => acc + k.requestsToday, 0);
  const avgResponseTime = requestLogs.length
    ? Math.round(requestLogs.reduce((acc, l) => acc + l.responseTimeMs, 0) / requestLogs.length)
    : 42;
  const successCount = requestLogs.filter((l) => l.status >= 200 && l.status < 300).length;
  const successRate = requestLogs.length ? +((successCount / requestLogs.length) * 100).toFixed(1) : 99.8;

  // Chart data simulation for last 7 days
  const dailyUsage = [
    { day: 'Seg', requests: 4120, validRate: 98.4 },
    { day: 'Ter', requests: 4890, validRate: 99.1 },
    { day: 'Qua', requests: 5210, validRate: 98.9 },
    { day: 'Qui', requests: 5900, validRate: 99.4 },
    { day: 'Sex', requests: 6840, validRate: 98.7 },
    { day: 'Sáb', requests: 3100, validRate: 99.2 },
    { day: 'Dom', requests: 2450, validRate: 99.0 },
  ];

  return {
    totalRequestsToday,
    avgResponseTime,
    successRate,
    activeKeys: apiKeys.filter((k) => k.active).length,
    dailyUsage,
    recentLogs: requestLogs.slice(0, 20),
  };
}

export async function processBatchCeps(cepsList: string[]): Promise<{
  total: number;
  validCount: number;
  invalidCount: number;
  overallScore: number;
  results: any[];
}> {
  const results = [];
  let validCount = 0;
  let scoreSum = 0;

  // Process maximum 100 at a time for performance
  const slice = cepsList.slice(0, 100);

  for (const raw of slice) {
    const clean = sanitizeCep(raw);
    try {
      const address = await fetchCepWithFallback(clean);
      const acc = getAvaliacoesByCep(clean);
      validCount += 1;
      scoreSum += address.qualityScore;

      results.push({
        cep: address.cep,
        valid: true,
        logradouro: address.logradouro,
        bairro: address.bairro,
        cidade: address.cidade,
        uf: address.uf,
        qualityScore: address.qualityScore,
        riskLevel: address.riskLevel,
        deliveryProbability: address.deliveryProbability,
        acessibilidade: acc.avaliacoes.length > 0,
        acessibilidadeNota: acc.stats.mediaNota,
        fonte: address.fonte,
      });
    } catch {
      results.push({
        cep: raw,
        valid: false,
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: '',
        qualityScore: 0,
        riskLevel: 'invalido',
        deliveryProbability: 0,
        acessibilidade: false,
        error: 'CEP inexistente ou não encontrado',
      });
    }
  }

  const overallScore = validCount > 0 ? Math.round(scoreSum / validCount) : 0;

  return {
    total: slice.length,
    validCount,
    invalidCount: slice.length - validCount,
    overallScore,
    results,
  };
}

export function getOpenApiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'CEP Solidário & Intelligence B2B API',
      version: '1.0.0',
      description:
        'API de validação e enriquecimento de endereços em tempo real para e-commerces, logísticas e mapeamento colaborativo de acessibilidade urbana.',
      contact: {
        name: 'Equipe CEP Solidário',
        email: 'suporte@cepsolidario.org.br',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor Principal',
      },
    ],
    paths: {
      '/v1/validate': {
        post: {
          summary: 'Valida e enriquece dados de um CEP (API Paga B2B)',
          parameters: [
            {
              name: 'x-api-key',
              in: 'header',
              required: false,
              schema: { type: 'string' },
              description: 'Chave de API do cliente',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cep: { type: 'string', example: '01310-100' },
                  },
                  required: ['cep'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Endereço enriquecido com score e dados ESG de acessibilidade',
            },
          },
        },
      },
      '/cep/{cep}': {
        get: {
          summary: 'Consulta endereço completo por CEP com fallback automático',
          parameters: [
            {
              name: 'cep',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '01310100' },
            },
          ],
          responses: {
            200: { description: 'Sucesso' },
            404: { description: 'CEP não encontrado' },
          },
        },
      },
      '/acessibilidade': {
        post: {
          summary: 'Cadastra avaliação colaborativa de acessibilidade para um CEP',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cep: { type: 'string' },
                    local_nome: { type: 'string' },
                    usuario_nome: { type: 'string' },
                    rampa_acesso: { type: 'boolean' },
                    elevador: { type: 'boolean' },
                    banheiro_adaptado: { type: 'boolean' },
                    vaga_pcd: { type: 'boolean' },
                    piso_tatil: { type: 'boolean' },
                    balcao_baixo: { type: 'boolean' },
                    interprete_libras: { type: 'boolean' },
                    sinalizacao_sonora: { type: 'boolean' },
                    espaco_calmo: { type: 'boolean' },
                    portas_largas: { type: 'boolean' },
                    comentario: { type: 'string' },
                    nota_facilidade: { type: 'integer', minimum: 1, maximum: 5 },
                  },
                },
              },
            },
          },
        },
      },
      '/mapa': {
        get: {
          summary: 'Locais acessíveis num raio de coordenadas GPS',
          parameters: [
            { name: 'lat', in: 'query', schema: { type: 'number' } },
            { name: 'lon', in: 'query', schema: { type: 'number' } },
            { name: 'radius', in: 'query', schema: { type: 'number', default: 25 } },
          ],
        },
      },
      '/v1/batch': {
        post: {
          summary: 'Validação em lote (Bulk) de até 1000 CEPs',
        },
      },
      '/checkout/session': {
        post: {
          summary: 'Criação de sessão de checkout Stripe para planos corporativos SaaS',
        },
      },
    },
  };
}
