import { fetchCepWithFallback, sanitizeCep } from './cepService.js';
import { getAvaliacoesByCep } from './acessibilidadeService.js';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

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

const apiKeys: ApiKeyItem[] = [];

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
const requestUsageDays = new Map<string, string>();

const PLAN_LIMITS: Record<CompanyUser['plan'], { rate: number; daily: number }> = {
  FREE: { rate: 60, daily: 100 },
  STARTUP: { rate: 120, daily: 1000 },
  BUSINESS: { rate: 300, daily: 10000 },
  ENTERPRISE: { rate: 1200, daily: 50000 },
};

function getPlanLimits(plan: CompanyUser['plan']) {
  return PLAN_LIMITS[plan];
}

function maskApiKey(key: string): string {
  return `${key.slice(0, 8)}••••••••${key.slice(-4)}`;
}

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

const companies: (CompanyUser & { passwordHash: string })[] = [];

export function registerCompany(name: string, email: string, password: string, cnpj?: string): CompanyUser {
  if (typeof name !== 'string' || !name.trim()) throw new Error('Nome da empresa é obrigatório.');
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('Informe um e-mail corporativo válido.');
  }
  if (typeof password !== 'string' || password.length < 12) {
    throw new Error('A senha deve conter pelo menos 12 caracteres.');
  }
  if (cnpj !== undefined && (typeof cnpj !== 'string' || cnpj.length > 32)) {
    throw new Error('CNPJ inválido.');
  }

  const existing = companies.find((c) => c.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    throw new Error('Já existe uma empresa cadastrada com este e-mail corporativo.');
  }

  const newComp = {
    id: `comp-${randomUUID()}`,
    name: name.trim() || 'Empresa Cadastrada',
    email: email.toLowerCase().trim(),
    cnpj: cnpj ? cnpj.trim() : undefined,
    plan: 'FREE' as const,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  companies.push(newComp);

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
  const limits = getPlanLimits(plan);
  for (const key of apiKeys) {
    if (key.companyId === companyId && key.active) {
      key.plan = plan;
      key.rateLimit = limits.rate;
      key.requestsLimitToday = limits.daily;
      key.requestsToday = Math.min(key.requestsToday, limits.daily);
    }
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

// In-memory request logs for analytics
const requestLogs: ApiRequestLog[] = [];

function resetDailyUsage(key: ApiKeyItem): void {
  const today = new Date().toISOString().slice(0, 10);
  if (requestUsageDays.get(key.id) !== today) {
    key.requestsToday = 0;
    requestUsageDays.set(key.id, today);
  }
}

export function listApiKeys(companyId: string): ApiKeyItem[] {
  return [...apiKeys]
    .filter((item) => item.companyId === companyId)
    .map((item) => {
      resetDailyUsage(item);
      return item;
    })
    .map((item) => ({ ...item, key: maskApiKey(item.key) }));
}

export function createApiKey(
  name: string,
  companyId: string
): ApiKeyItem {
  const company = companies.find((item) => item.id === companyId);
  if (!company) throw new Error('Empresa não encontrada.');
  const plan = company.plan;
  const prefix = plan === 'FREE' ? 'cs_test_' : 'cs_live_';
  const randomHex = randomBytes(20).toString('hex');
  const key = `${prefix}${randomHex}`;
  const limits = getPlanLimits(plan);

  const newKey: ApiKeyItem = {
    id: `key-${randomUUID()}`,
    key,
    name: name.trim() || `API Key ${plan}`,
    plan,
    rateLimit: limits.rate,
    requestsToday: 0,
    requestsLimitToday: limits.daily,
    created_at: new Date().toISOString(),
    active: true,
    companyId,
  };

  apiKeys.unshift(newKey);
  resetDailyUsage(newKey);
  return newKey;
}

export function revokeApiKey(id: string, companyId: string): boolean {
  const idx = apiKeys.findIndex((k) => k.id === id && k.companyId === companyId);
  if (idx !== -1) {
    requestWindows.delete(apiKeys[idx].key);
    requestUsageDays.delete(apiKeys[idx].id);
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

}

export function authenticateApiKey(rawKey: string | undefined): ApiKeyItem | null {
  if (!rawKey) return null;
  const key = apiKeys.find((item) => item.key === rawKey && item.active);
  if (!key) return null;
  resetDailyUsage(key);

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
  key.requestsToday += 1;
  return key;
}

export function getUsageStats(companyId: string) {
  const companyKeys = apiKeys.filter((key) => key.companyId === companyId);
  companyKeys.forEach(resetDailyUsage);
  const companyKeyIds = new Set(companyKeys.map((key) => key.id));
  const companyLogs = requestLogs.filter((log) => companyKeyIds.has(log.apiKeyId));
  const totalRequestsToday = companyKeys.reduce((acc, key) => acc + key.requestsToday, 0);
  const avgResponseTime = companyLogs.length
    ? Math.round(companyLogs.reduce((acc, log) => acc + log.responseTimeMs, 0) / companyLogs.length)
    : 0;
  const successCount = companyLogs.filter((log) => log.status >= 200 && log.status < 300).length;
  const successRate = companyLogs.length ? +((successCount / companyLogs.length) * 100).toFixed(1) : 0;
  const today = new Date();
  const dailyUsage = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const dayLogs = companyLogs.filter((log) => log.timestamp.slice(0, 10) === dateKey);
    const validCount = dayLogs.filter((log) => log.status >= 200 && log.status < 300).length;
    return {
      day: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date),
      requests: dayLogs.length,
      validRate: dayLogs.length ? +((validCount / dayLogs.length) * 100).toFixed(1) : 0,
    };
  });

  return {
    totalRequestsToday,
    avgResponseTime,
    successRate,
    activeKeys: companyKeys.filter((key) => key.active).length,
    dailyUsage,
    recentLogs: companyLogs.slice(0, 20),
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
        'API demonstrativa de consulta de CEP e mapeamento colaborativo. Chaves, métricas e sessões B2B são mantidas em memória; pagamentos não estão habilitados.',
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
          summary: 'Valida e enriquece um CEP usando API key',
          parameters: [
            {
              name: 'x-api-key',
              in: 'header',
              required: true,
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
          summary: 'Validação em lote de até 100 CEPs',
        },
      },
      '/checkout/session': {
        post: {
          summary: 'Checkout indisponível enquanto a integração de pagamento não estiver configurada',
          responses: {
            501: { description: 'Integração de pagamento não configurada' },
          },
        },
      },
      '/webhooks/stripe': {
        post: {
          summary: 'Webhook de pagamento indisponível',
          responses: {
            501: { description: 'Integração e verificação de assinatura não configuradas' },
          },
        },
      },
    },
  };
}
