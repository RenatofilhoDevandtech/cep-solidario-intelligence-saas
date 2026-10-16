/**
 * Script Didático de Teste de Integração: Módulo de Banco de Dados & Pessoas
 *
 * Como executar:
 * npx tsx scripts/test-db.ts
 *
 * Objetivo de Aprendizado:
 * Demonstrar como testar diretamente a camada de dados (repositories/queries),
 * validando inserção, consulta e o status de conexão com o MySQL / Docker Volume.
 */

import 'dotenv/config';
import { initDb, getPessoasDb, createPessoaDb, deletePessoaDb, getDbHealth } from '../server/db.js';

async function executarTestes() {
  console.log('====================================================');
  console.log('🧪 TESTE 1: AUDITORIA DE INFRAESTRUTURA DOCKER & BANCO');
  console.log('====================================================\n');

  await initDb();
  const health = getDbHealth();
  console.log('🔍 Status da Conexão:', health.isConnected ? '🟢 CONECTADO AO MYSQL' : '🟡 MODO FALLBACK (MEMÓRIA)');
  console.log(`🌐 Host do Banco: ${health.host}:${health.port}`);
  console.log(`📁 Base de Dados: ${health.database}`);
  console.log(`💾 Volume Docker Mapeado: ${health.volumeName}`);
  console.log(`🔗 Rede Docker: ${health.network}\n`);

  console.log('====================================================');
  console.log('🧪 TESTE 2: CONSULTA INICIAL DE REGISTROS (READ)');
  console.log('====================================================\n');

  const pessoasIniciais = await getPessoasDb();
  console.log(`📋 Total de pessoas encontradas antes do teste: ${pessoasIniciais.length}`);
  console.log('\n');

  console.log('====================================================');
  console.log('🧪 TESTE 3: INSERÇÃO DE NOVA PESSOA E ENDEREÇO (CREATE)');
  console.log('====================================================\n');

  const payloadTeste = {
    nome: 'Pessoa sintética de teste',
    cpf: '000.000.000-00',
    cep: '00000-000',
    numero: '0',
    complemento: '',
    logradouro: 'Endereço de teste',
    bairro: 'Bairro de teste',
    localidade: 'Cidade de teste',
    uf: 'ZZ',
    estado: 'Estado de teste',
    rua: 'Rua de teste',
    termo_lgpd: true,
  };

  let pessoaCriada: Awaited<ReturnType<typeof createPessoaDb>> | null = null;
  try {
    console.log('⏳ Enviando registro sintético para gravação no banco...');
    pessoaCriada = await createPessoaDb(payloadTeste);

    console.log('====================================================');
    console.log('🧪 TESTE 4: CONFIRMAÇÃO DE PERSISTÊNCIA (ASSERTION)');
    console.log('====================================================\n');

    const pessoasAposInsercao = await getPessoasDb();
    const encontrado = pessoasAposInsercao.find((p) => p.id === pessoaCriada?.id);
    if (!encontrado) {
      throw new Error('❌ FALHA NO TESTE: O registro sintético não foi encontrado após inserção.');
    }

    console.log('✅ Inserção e leitura confirmadas; dados pessoais do registro não foram exibidos.');
  } finally {
    if (pessoaCriada) {
      await deletePessoaDb(pessoaCriada.id);
      console.log('🧹 Registro sintético removido ao finalizar o teste.');
    }
  }

  console.log('\n====================================================');
  console.log('✨ TESTE DE BANCO CONCLUÍDO COM SUCESSO! ✨');
  console.log('====================================================');
}

executarTestes().catch((erro) => {
  console.error('\n❌ ERRO DURANTE A EXECUÇÃO DOS TESTES:', erro);
  process.exit(1);
});
