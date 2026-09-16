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
import { getPessoasDb, createPessoaDb, getDbHealth } from '../server/db.js';

async function executarTestes() {
  console.log('====================================================');
  console.log('🧪 TESTE 1: AUDITORIA DE INFRAESTRUTURA DOCKER & BANCO');
  console.log('====================================================\n');

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
  if (pessoasIniciais.length > 0) {
    console.log('Primeiro registro encontrado:', {
      nome: pessoasIniciais[0].nome,
      cpf: pessoasIniciais[0].cpf,
      cidade: pessoasIniciais[0].localidade,
      uf: pessoasIniciais[0].uf,
    });
  }
  console.log('\n');

  console.log('====================================================');
  console.log('🧪 TESTE 3: INSERÇÃO DE NOVA PESSOA E ENDEREÇO (CREATE)');
  console.log('====================================================\n');

  const payloadTeste = {
    nome: 'Carlos Drummond de Andrade (Teste Automatizado)',
    cpf: '888.777.666-55',
    cep: '30130-100',
    numero: '120',
    complemento: 'Gabinete Literário',
    logradouro: 'Praça da Liberdade',
    bairro: 'Savassi',
    localidade: 'Belo Horizonte',
    uf: 'MG',
    estado: 'Minas Gerais',
    rua: 'Praça da Liberdade',
    termo_lgpd: true,
  };

  console.log('⏳ Enviando registro para gravação no banco...');
  const pessoaCriada = await createPessoaDb(payloadTeste);

  console.log('✅ Registro gravado com sucesso!');
  console.log('ID Gerado:', pessoaCriada.id);
  console.log('Nome:', pessoaCriada.nome);
  console.log('CPF:', pessoaCriada.cpf);
  console.log('Data de Criação:', pessoaCriada.created_at);
  console.log('\n');

  console.log('====================================================');
  console.log('🧪 TESTE 4: CONFIRMAÇÃO DE PERSISTÊNCIA (ASSERTION)');
  console.log('====================================================\n');

  const pessoasAposInsercao = await getPessoasDb();
  console.log(`📋 Total de pessoas após inserção: ${pessoasAposInsercao.length}`);

  const encontrado = pessoasAposInsercao.find((p) => p.cpf === payloadTeste.cpf);
  if (!encontrado) {
    throw new Error('❌ FALHA NO TESTE: O registro inserido não foi encontrado na consulta!');
  }

  console.log('🎉 SUCESSO ABSOLUTO: O registro foi localizado na lista e está devidamente persistido!');
  console.log('Detalhes do registro validado:', {
    id: encontrado.id,
    nome: encontrado.nome,
    endereco: `${encontrado.logradouro}, ${encontrado.numero} - ${encontrado.bairro}, ${encontrado.localidade}/${encontrado.uf}`,
  });
  console.log('\n====================================================');
  console.log('✨ TODOS OS TESTES PASSARAM COM SUCESSO! ✨');
  console.log('====================================================');
}

executarTestes().catch((erro) => {
  console.error('\n❌ ERRO DURANTE A EXECUÇÃO DOS TESTES:', erro);
  process.exit(1);
});
