import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchCepWithFallback } from './server/cepService.js';
import {
  getAllAvaliacoes,
  getAvaliacoesByCep,
  createAvaliacao,
  upvoteAvaliacao,
  getLocaisProximos,
  getMapaNacional,
  exportAvaliacoesCsv,
} from './server/acessibilidadeService.js';
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  logRequest,
  getUsageStats,
  processBatchCeps,
  getOpenApiSpec,
  registerCompany,
  authenticateCompany,
  updateCompanyPlanById,
  createCompanySession,
  getCompanyBySession,
  destroyCompanySession,
  authenticateApiKey,
} from './server/b2bService.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: (req) => req.path === '/api/health',
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const getCookie = (req: express.Request, name: string): string | undefined => {
    const cookies = req.headers.cookie?.split(';').map((item) => item.trim()) || [];
    const value = cookies.find((item) => item.startsWith(`${name}=`));
    return value ? decodeURIComponent(value.slice(name.length + 1)) : undefined;
  };

  const requireCompanySession: express.RequestHandler = (req, res, next) => {
    const company = getCompanyBySession(getCookie(req, 'cs_session'));
    if (!company) {
      return res.status(401).json({ error: 'Autenticação corporativa necessária.' });
    }
    res.locals.company = company;
    next();
  };

  const requireApiKey: express.RequestHandler = (req, res, next) => {
    const key = authenticateApiKey(req.headers['x-api-key'] as string | undefined);
    if (!key) {
      return res.status(401).json({ error: 'API key ausente, inválida ou com limite excedido.' });
    }
    res.locals.apiKey = key;
    next();
  };

  // API Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      service: 'CEP Solidário & Intelligence API',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Consulta CEP com Fallback
  const handleCepLookup = async (req: express.Request, res: express.Response) => {
    const startTime = Date.now();
    const cep = req.params.cep || (req.body && req.body.cep);
    const apiKey = (req.headers['x-api-key'] as string) || 'public_web';

    if (!cep) {
      return res.status(400).json({ error: 'Parâmetro CEP é obrigatório' });
    }

    try {
      const addressData = await fetchCepWithFallback(cep);
      const acessibilidadeInfo = getAvaliacoesByCep(cep);

      const responseTime = Date.now() - startTime;
      logRequest(apiKey, '/api/cep', addressData.cep, 200, responseTime, addressData.fonte);

      return res.json({
        ...addressData,
        acessibilidade: acessibilidadeInfo.stats,
        totalAvaliacoes: acessibilidadeInfo.stats.total,
        avaliacoes: acessibilidadeInfo.avaliacoes,
        responseTimeMs: responseTime,
      });
    } catch (err: any) {
      const responseTime = Date.now() - startTime;
      logRequest(apiKey, '/api/cep', String(cep), 404, responseTime, 'Nenhum');
      return res.status(404).json({
        error: err.message || 'Não foi possível encontrar o CEP informado.',
        cep,
      });
    }
  };

  app.get('/api/cep/:cep', handleCepLookup);
  app.post('/api/cep/:cep', handleCepLookup);
  app.get('/api/v1/cep/:cep', handleCepLookup);

  // 2. Validação B2B Paga (/api/v1/validate)
  app.post('/api/v1/validate', requireApiKey, async (req, res) => {
    const startTime = Date.now();
    const cep = req.body?.cep || req.query.cep;
    const apiKey = res.locals.apiKey.id;

    if (!cep) {
      return res.status(400).json({ error: 'Campo "cep" é obrigatório no corpo da requisição.' });
    }

    try {
      const addressData = await fetchCepWithFallback(String(cep));
      const acessibilidadeInfo = getAvaliacoesByCep(String(cep));
      const responseTime = Date.now() - startTime;

      logRequest(apiKey, '/api/v1/validate', addressData.cep, 200, responseTime, addressData.fonte);

      res.json({
        success: true,
        data: {
          cep: addressData.cep,
          logradouro: addressData.logradouro,
          complemento: addressData.complemento,
          bairro: addressData.bairro,
          cidade: addressData.cidade,
          uf: addressData.uf,
          ibge: addressData.ibge,
          ddd: addressData.ddd,
          coordenadas: {
            lat: addressData.lat,
            lon: addressData.lon,
          },
          score_qualidade: addressData.qualityScore,
          probabilidade_entrega_pct: addressData.deliveryProbability,
          nivel_risco: addressData.riskLevel,
          analise_risco: addressData.riskDescription,
          esg_acessibilidade: {
            possui_dados: acessibilidadeInfo.stats.total > 0,
            nota_media: acessibilidadeInfo.stats.mediaNota,
            indice_rampa: `${acessibilidadeInfo.stats.percentRampa}%`,
            indice_elevador: `${acessibilidadeInfo.stats.percentElevador}%`,
            total_avaliadores: acessibilidadeInfo.stats.total,
          },
        },
        meta: {
          fonte_primaria: addressData.fonte,
          tempo_resposta_ms: responseTime,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      const responseTime = Date.now() - startTime;
      logRequest(apiKey, '/api/v1/validate', String(cep), 404, responseTime, 'Erro');
      res.status(404).json({
        success: false,
        error: err.message || 'Endereço não localizado.',
      });
    }
  });

  // 3. Avaliações de Acessibilidade
  app.post('/api/acessibilidade', async (req, res) => {
    try {
      const {
        cep,
        local_nome,
        usuario_nome,
        rampa_acesso,
        elevador,
        banheiro_adaptado,
        vaga_pcd,
        piso_tatil,
        balcao_baixo,
        interprete_libras,
        sinalizacao_sonora,
        espaco_calmo,
        portas_largas,
        comentario,
        fotos,
        nota_facilidade,
      } = req.body;

      if (!cep) {
        return res.status(400).json({ error: 'CEP é obrigatório para cadastrar avaliação de acessibilidade' });
      }

      // Try to enrich with city/lat/lon
      let lat = -23.5505;
      let lon = -46.6333;
      let cidade = 'São Paulo';
      let uf = 'SP';
      let bairro = 'Centro';

      try {
        const enriched = await fetchCepWithFallback(cep);
        lat = enriched.lat;
        lon = enriched.lon;
        cidade = enriched.cidade;
        uf = enriched.uf;
        bairro = enriched.bairro;
      } catch {
        // use defaults
      }

      const nova = createAvaliacao({
        cep,
        local_nome,
        usuario_nome,
        rampa_acesso,
        elevador,
        banheiro_adaptado,
        vaga_pcd,
        piso_tatil,
        balcao_baixo,
        interprete_libras,
        sinalizacao_sonora,
        espaco_calmo,
        portas_largas,
        comentario,
        fotos,
        nota_facilidade: Number(nota_facilidade) || 5,
        lat,
        lon,
        cidade,
        uf,
        bairro,
      });

      res.status(201).json({ success: true, message: 'Avaliação cadastrada com sucesso!', avaliacao: nova });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao registrar avaliação' });
    }
  });

  app.get('/api/acessibilidade/:cep', (req, res) => {
    const result = getAvaliacoesByCep(req.params.cep);
    res.json(result);
  });

  app.get('/api/acessibilidade', (req, res) => {
    const all = getAllAvaliacoes();
    res.json({ total: all.length, avaliacoes: all });
  });

  // Upvote de avaliação
  app.put('/api/acessibilidade/:id/upvote', (req, res) => {
    const result = upvoteAvaliacao(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    res.json(result);
  });

  // Mapa colaborativo num raio
  app.get('/api/mapa', (req, res) => {
    const lat = req.query.lat ? Number(req.query.lat) : -23.5505;
    const lon = req.query.lon ? Number(req.query.lon) : -46.6333;
    const radius = req.query.radius ? Number(req.query.radius) : 50;

    const locais = getLocaisProximos(lat, lon, radius);
    res.json({
      centro: { lat, lon },
      raio_km: radius,
      total_locais: locais.length,
      locais,
    });
  });

  // Base Nacional de Acessibilidade - Visão Panorâmica de Todo o Brasil
  app.get('/api/mapa/nacional', (req, res) => {
    const dados = getMapaNacional();
    res.json(dados);
  });

  // Exportar dados em CSV para ONGs e prefeituras
  app.get('/api/export/csv', (req, res) => {
    const csvContent = exportAvaliacoesCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="cep-solidario-acessibilidade.csv"');
    res.send(csvContent);
  });

  // Autenticação e Ciclo de Vida da Empresa (B2B)
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, cnpj } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome da empresa, e-mail corporativo e senha são obrigatórios.' });
      }
      const company = registerCompany(name, email, password, cnpj);
      const session = createCompanySession(company.id);
      res.setHeader('Set-Cookie', `cs_session=${encodeURIComponent(session)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
      res.status(201).json({ success: true, company });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao registrar empresa' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      }
      const company = authenticateCompany(email, password);
      const session = createCompanySession(company.id);
      res.setHeader('Set-Cookie', `cs_session=${encodeURIComponent(session)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
      res.json({ success: true, company });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Credenciais inválidas' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    destroyCompanySession(getCookie(req, 'cs_session'));
    res.setHeader('Set-Cookie', 'cs_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
    res.json({ success: true });
  });

  app.post('/api/auth/update-plan', requireCompanySession, (req, res) => {
    try {
      const { plan } = req.body;
      if (!plan) {
        return res.status(400).json({ error: 'Plano é obrigatório.' });
      }
      if (!['FREE', 'STARTUP', 'BUSINESS', 'ENTERPRISE'].includes(plan)) {
        return res.status(400).json({ error: 'Plano inválido.' });
      }
      const updated = updateCompanyPlanById(res.locals.company.id, plan);
      res.json({ success: true, company: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao atualizar plano' });
    }
  });

  // 4. B2B SaaS: Gestão de API Keys e Estatísticas
  app.get('/api/admin/usage', requireCompanySession, (req, res) => {
    const stats = getUsageStats();
    res.json(stats);
  });

  app.get('/api/api-keys', requireCompanySession, (req, res) => {
    res.json({ keys: listApiKeys(res.locals.company.id) });
  });

  app.post('/api/api-keys', requireCompanySession, (req, res) => {
    const { name, plan } = req.body;
    const key = createApiKey(name || 'Chave de Produção', plan || 'STARTUP', res.locals.company.id);
    res.status(201).json({ success: true, key });
  });

  app.delete('/api/api-keys/:id', requireCompanySession, (req, res) => {
    const success = revokeApiKey(req.params.id, res.locals.company.id);
    res.json({ success });
  });

  // Validação em Lote (Batch)
  app.post('/api/v1/batch', requireApiKey, async (req, res) => {
    const ceps = req.body?.ceps;
    if (!Array.isArray(ceps) || ceps.length === 0) {
      return res.status(400).json({ error: 'Envie uma lista no campo "ceps": ["01310100", "22041001"]' });
    }
    const result = await processBatchCeps(ceps);
    res.json(result);
  });

  // Webhook Stripe & Checkout Session API
  app.post('/api/checkout/session', (req, res) => {
    const { plan, email } = req.body;
    const planName = plan || 'STARTUP';
    const prices: Record<string, number> = {
      STARTUP: 9900,
      BUSINESS: 49900,
      ENTERPRISE: 249900,
    };
    const amount = prices[planName] || 9900;
    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    res.json({
      success: true,
      sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}?plan=${planName}&amount=${amount}`,
      amount,
      currency: 'BRL',
      plan: planName,
      customerEmail: email || 'contato@empresa.com.br',
      message: 'Sessão de checkout segura gerada com sucesso (Modo Teste / Sandbox).',
    });
  });

  app.post('/api/webhooks/stripe', (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || req.headers['x-webhook-secret'] !== webhookSecret) {
      return res.status(401).json({ error: 'Webhook não autorizado.' });
    }
    const { plan, email, customerId } = req.body;
    res.json({
      received: true,
      event: 'customer.subscription.created',
      status: 'active',
      plan: plan || 'BUSINESS',
      customer: email || 'cliente@empresa.com.br',
      customerId: customerId || 'cus_demo_98231',
    });
  });

  // Documentação OpenAPI JSON
  app.get('/api/docs/openapi.json', (req, res) => {
    res.json(getOpenApiSpec());
  });

  // 5. Integração Vite (middleware no dev, estáticos no prod)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CEP Solidário & Intelligence] Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
