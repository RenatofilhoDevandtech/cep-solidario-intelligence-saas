/**
 * Script Didático de Teste de API REST (End-to-End com HTTP)
 *
 * Como executar:
 * npx tsx scripts/test-api.ts
 *
 * Objetivo de Aprendizado:
 * Demonstrar como testar chamadas reais de API REST via protocolo HTTP,
 * validando códigos de status (200, 201), payloads JSON e cabeçalhos.
 */

import 'dotenv/config';

async function resolveBaseUrl(): Promise<string> {
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
  try {
    const res3000 = await fetch('http://localhost:3000/api/system/docker-status', { signal: AbortSignal.timeout(1000) });
    if (res3000.status < 500) return 'http://localhost:3000/api';
  } catch {}
  try {
    const res5000 = await fetch('http://localhost:5000/api/system/docker-status', { signal: AbortSignal.timeout(1000) });
    if (res5000.status < 500) return 'http://localhost:5000/api';
  } catch {}
  return 'http://localhost:3000/api';
}

async function testarApiRest() {
  const BASE_URL = await resolveBaseUrl();
  console.log('====================================================');
  console.log('🌐 TESTE 1: VERIFICAÇÃO DE TELEMETRIA (HEALTH & DOCKER)');
  console.log(`Target: ${BASE_URL}/system/docker-status`);
  console.log('====================================================\n');

  try {
    const resStatus = await fetch(`${BASE_URL}/system/docker-status`);
    if (!resStatus.ok) {
      throw new Error(`Servidor retornou HTTP ${resStatus.status}`);
    }
    const dataStatus = await resStatus.json();
    console.log('✅ Endpoint de telemetria respondeu com sucesso!');
    console.log('Estado dos Serviços:', dataStatus.services);
    console.log('Rede Docker:', dataStatus.network);
  } catch (err: any) {
    console.warn(`⚠️ Aviso de Conexão: Não foi possível conectar a ${BASE_URL}/system/docker-status.`);
    console.warn('Certifique-se de que o backend está rodando (`npm run dev` ou `docker compose up`).\n');
  }

  console.log('\n====================================================');
  console.log('🌐 TESTE 2: LISTAGEM DE PESSOAS (GET /api/pessoas)');
  console.log(`Target: ${BASE_URL}/pessoas`);
  console.log('====================================================\n');

  try {
    const resGet = await fetch(`${BASE_URL}/pessoas`);
    if (resGet.ok) {
      const pessoas = await resGet.json();
      console.log(`✅ HTTP 200 OK! Total de registros recebidos: ${pessoas.length}`);
      if (pessoas.length > 0) {
        console.log('Exemplo de dado retornado:', {
          id: pessoas[0].id,
          nome: pessoas[0].nome,
          cidade: pessoas[0].localidade,
          uf: pessoas[0].uf,
        });
      }
    } else {
      console.error(`❌ HTTP Error: ${resGet.status}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ Não foi possível testar o GET: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log('🌐 TESTE 3: CADASTRO COM AUTO-COMPLETAR (POST /api/pessoas)');
  console.log(`Target: ${BASE_URL}/pessoas`);
  console.log('====================================================\n');

  try {
    const payloadNovo = {
      nome: 'Clarice Lispector (Teste HTTP)',
      cpf: '777.666.555-44',
      cep: '22041-001',
      numero: '780',
      complemento: 'Apto 301',
      // Repare: deixamos de propósito sem logradouro/bairro para testar
      // se o backend faz a busca automática na API de CEP!
    };

    console.log('Enviando payload sem endereço para testar enriquecimento automático de CEP:');
    console.log(payloadNovo);

    const resPost = await fetch(`${BASE_URL}/pessoas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadNovo),
    });

    if (resPost.status === 201) {
      const dataPost = await resPost.json();
      console.log('✅ HTTP 201 CREATED! Registro cadastrado com sucesso!');
      console.log('Dados preenchidos automaticamente pela API de CEP:', {
        id: dataPost.pessoa.id,
        nome: dataPost.pessoa.nome,
        logradouro: dataPost.pessoa.logradouro,
        bairro: dataPost.pessoa.bairro,
        localidade: dataPost.pessoa.localidade,
        uf: dataPost.pessoa.uf,
        estado: dataPost.pessoa.estado,
      });
    } else {
      const erro = await resPost.json().catch(() => ({}));
      console.error(`❌ Erro no POST HTTP ${resPost.status}:`, erro);
    }
  } catch (err: any) {
    console.warn(`⚠️ Não foi possível testar o POST: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log('✨ FIM DO TESTE DE API REST ✨');
  console.log('====================================================');
}

testarApiRest();
