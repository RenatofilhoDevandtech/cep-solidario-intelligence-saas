/**
 * Script Didático de Teste de API REST (End-to-End com HTTP)
 *
 * Como executar:
 * npx tsx scripts/test-api.ts
 *
 * Objetivo de Aprendizado:
 * Demonstrar como testar chamadas reais de API REST via protocolo HTTP,
 * validando respostas agregadas, rejeição sem consentimento e códigos HTTP.
 */

import 'dotenv/config';

async function resolveBaseUrl(): Promise<string> {
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
  for (const baseUrl of ['http://localhost:3000/api', 'http://localhost:5000/api']) {
    try {
      const response = await fetch(`${baseUrl}/system/docker-status`, { signal: AbortSignal.timeout(1000) });
      if (response.status < 500) return baseUrl;
    } catch {
      // Try the next local development port.
    }
  }
  throw new Error('Backend não encontrado. Inicie `npm run dev` ou `docker compose up` e tente novamente.');
}

async function testarApiRest() {
  const BASE_URL = await resolveBaseUrl();
  console.log('====================================================');
  console.log('🌐 TESTE 1: VERIFICAÇÃO DE TELEMETRIA (HEALTH & DOCKER)');
  console.log(`Target: ${BASE_URL}/system/docker-status`);
  console.log('====================================================\n');

  const resStatus = await fetch(`${BASE_URL}/system/docker-status`);
  if (!resStatus.ok) throw new Error(`Telemetria retornou HTTP ${resStatus.status}.`);
  const dataStatus = await resStatus.json();
  console.log('✅ Endpoint de telemetria respondeu com sucesso!');
  console.log('Estado dos Serviços:', dataStatus.services);
  console.log('Rede Docker:', dataStatus.network);

  console.log('\n====================================================');
  console.log('🌐 TESTE 2: RESUMO ANONIMIZADO (GET /api/pessoas)');
  console.log(`Target: ${BASE_URL}/pessoas`);
  console.log('====================================================\n');

  const resGet = await fetch(`${BASE_URL}/pessoas`);
  if (!resGet.ok) throw new Error(`GET /pessoas retornou HTTP ${resGet.status}.`);
  const pessoas: unknown = await resGet.json();
  if (
    !pessoas ||
    typeof pessoas !== 'object' ||
    !('total' in pessoas) ||
    typeof pessoas.total !== 'number' ||
    !Number.isInteger(pessoas.total) ||
    !('cidades' in pessoas) ||
    !Array.isArray(pessoas.cidades)
  ) {
    throw new Error('O endpoint não retornou o resumo agregado esperado.');
  }
  const resumo = { total: pessoas.total, cidades: pessoas.cidades };
  console.log(`✅ HTTP 200 OK! Total de cadastros: ${resumo.total}; municípios: ${resumo.cidades.length}`);
  if (resumo.cidades.some((cidade) => {
    return Boolean(cidade && typeof cidade === 'object' && ('cpf' in cidade || 'nome' in cidade || 'cep' in cidade));
  })) {
    throw new Error('O resumo público contém campos pessoais que não deveriam ser expostos.');
  }

  console.log('\n====================================================');
  console.log('🌐 TESTE 3: CONSENTIMENTO EXPLÍCITO (POST /api/pessoas)');
  console.log(`Target: ${BASE_URL}/pessoas`);
  console.log('====================================================\n');

  const payloadSemConsentimento = {
    nome: 'Pessoa sintética de teste',
    cpf: '000.000.000-00',
    cep: '00000-000',
    numero: '0',
    termo_lgpd: false,
  };

  const resPost = await fetch(`${BASE_URL}/pessoas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadSemConsentimento),
  });

  if (resPost.status !== 400) {
    throw new Error(`O endpoint deveria rejeitar cadastro sem consentimento, mas respondeu HTTP ${resPost.status}.`);
  }
  console.log('✅ HTTP 400: o backend rejeitou o cadastro sem consentimento e não persistiu dados.');

  console.log('\n====================================================');
  console.log('✨ FIM DO TESTE DE API REST ✨');
  console.log('====================================================');
}

testarApiRest().catch((error: unknown) => {
  console.error('❌ Falha no teste de API:', error);
  process.exitCode = 1;
});
