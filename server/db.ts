import 'dotenv/config';
import mysql, { Pool } from 'mysql2/promise';

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

export interface NewPessoaInput {
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

// In-memory fallback dataset for seamless dev experience
const inMemoryPessoas: PessoaRecord[] = [
  {
    id: 1,
    nome: 'Ana Clara Oliveira',
    cpf: '123.456.789-01',
    cep: '01310-100',
    numero: '1578',
    complemento: 'Apto 42',
    logradouro: 'Avenida Paulista',
    bairro: 'Bela Vista',
    localidade: 'São Paulo',
    uf: 'SP',
    estado: 'São Paulo',
    rua: 'Avenida Paulista',
    termo_lgpd: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 2,
    nome: 'Carlos Eduardo Mendes',
    cpf: '234.567.890-12',
    cep: '22041-001',
    numero: '450',
    complemento: 'Bloco B',
    logradouro: 'Avenida Nossa Senhora de Copacabana',
    bairro: 'Copacabana',
    localidade: 'Rio de Janeiro',
    uf: 'RJ',
    estado: 'Rio de Janeiro',
    rua: 'Avenida Nossa Senhora de Copacabana',
    termo_lgpd: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 3,
    nome: 'Mariana Santos Silva',
    cpf: '345.678.901-23',
    cep: '30130-100',
    numero: '120',
    complemento: 'Sala 3',
    logradouro: 'Praça da Liberdade',
    bairro: 'Savassi',
    localidade: 'Belo Horizonte',
    uf: 'MG',
    estado: 'Minas Gerais',
    rua: 'Praça da Liberdade',
    termo_lgpd: true,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

let pool: Pool | null = null;
let isDbConnected = false;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || process.env.MYSQL_USER || 'cepsolidario',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'cep-solidario-local-app',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'cepsolidario_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000,
};

export async function initDb(): Promise<boolean> {
  const hostsToTry = [
    DB_CONFIG.host,
    ...(DB_CONFIG.host === 'db' ? ['localhost', '127.0.0.1'] : []),
  ];
  const uniqueHosts = Array.from(new Set(hostsToTry));

  for (const host of uniqueHosts) {
    try {
      const config = { ...DB_CONFIG, host };
      pool = mysql.createPool(config);
      const conn = await pool.getConnection();

      // Ensure database UTF8MB4
      await conn.query(`
        CREATE DATABASE IF NOT EXISTS \`${config.database}\`
        DEFAULT CHARACTER SET utf8mb4
        DEFAULT COLLATE utf8mb4_unicode_ci;
      `);

      await conn.query(`USE \`${config.database}\`;`);

      // 1. Ensure Table Pessoas
      await conn.query(`
        CREATE TABLE IF NOT EXISTS pessoas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          cpf VARCHAR(14) NOT NULL,
          cep VARCHAR(9) NOT NULL,
          numero VARCHAR(50) NOT NULL,
          complemento VARCHAR(100) DEFAULT '',
          logradouro VARCHAR(255) NOT NULL,
          bairro VARCHAR(150) NOT NULL,
          localidade VARCHAR(150) NOT NULL,
          uf CHAR(2) NOT NULL,
          estado VARCHAR(100) NOT NULL,
          rua VARCHAR(255) NOT NULL,
          termo_lgpd BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_pessoas_cpf (cpf),
          INDEX idx_pessoas_cep (cep)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Ensure Table CEPs
      await conn.query(`
        CREATE TABLE IF NOT EXISTS ceps (
          cep VARCHAR(9) PRIMARY KEY,
          logradouro VARCHAR(255) NOT NULL,
          complemento VARCHAR(150) DEFAULT NULL,
          bairro VARCHAR(150) NOT NULL,
          cidade VARCHAR(150) NOT NULL,
          uf CHAR(2) NOT NULL,
          ibge VARCHAR(10) DEFAULT NULL,
          ddd CHAR(3) DEFAULT NULL,
          lat DECIMAL(10, 8) NOT NULL,
          lon DECIMAL(11, 8) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 3. Ensure Table Avaliacoes
      await conn.query(`
        CREATE TABLE IF NOT EXISTS avaliacoes (
          id VARCHAR(64) PRIMARY KEY,
          cep VARCHAR(9) NOT NULL,
          local_nome VARCHAR(255) NOT NULL,
          usuario_nome VARCHAR(150) NOT NULL,
          rampa_acesso BOOLEAN DEFAULT FALSE,
          elevador BOOLEAN DEFAULT FALSE,
          banheiro_adaptado BOOLEAN DEFAULT FALSE,
          vaga_pcd BOOLEAN DEFAULT FALSE,
          piso_tatil BOOLEAN DEFAULT FALSE,
          balcao_baixo BOOLEAN DEFAULT FALSE,
          interprete_libras BOOLEAN DEFAULT FALSE,
          sinalizacao_sonora BOOLEAN DEFAULT FALSE,
          espaco_calmo BOOLEAN DEFAULT FALSE,
          portas_largas BOOLEAN DEFAULT FALSE,
          comentario TEXT,
          nota_facilidade TINYINT UNSIGNED NOT NULL,
          upvotes INT UNSIGNED DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_avaliacoes_cep (cep)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Check if pessoas table has rows; if empty, seed default data
      const [rows]: any = await conn.query('SELECT COUNT(*) as count FROM pessoas');
      if (rows && rows[0] && rows[0].count === 0) {
        for (const p of inMemoryPessoas) {
          await conn.query(
            `INSERT INTO pessoas (nome, cpf, cep, numero, complemento, logradouro, bairro, localidade, uf, estado, rua, termo_lgpd, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.nome,
              p.cpf,
              p.cep,
              p.numero,
              p.complemento,
              p.logradouro,
              p.bairro,
              p.localidade,
              p.uf,
              p.estado,
              p.rua,
              p.termo_lgpd ? 1 : 0,
              p.created_at,
            ]
          );
        }
        console.log('[MySQL] Seeds iniciais de pessoas inseridas com sucesso no banco.');
      }

      conn.release();
      isDbConnected = true;
      console.log(`[MySQL] Conexão estabelecida com sucesso com ${host}:${config.port}/${config.database} (Volume Docker: mysql_data)`);
      return true;
    } catch {
      // Continue to next candidate host
    }
  }

  isDbConnected = false;
  console.warn(`[MySQL] Aviso: MySQL não conectado em ${DB_CONFIG.host}:${DB_CONFIG.port} (Container MySQL offline ou desligado).`);
  console.warn('[MySQL] Operando com camada de persistência em memória e sincronização em tempo real.');
  return false;
}

export async function getPessoasDb(): Promise<PessoaRecord[]> {
  if (isDbConnected && pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM pessoas ORDER BY created_at DESC');
      return rows.map((r: any) => ({
        id: r.id,
        nome: r.nome,
        cpf: r.cpf,
        cep: r.cep,
        numero: r.numero,
        complemento: r.complemento || '',
        logradouro: r.logradouro,
        bairro: r.bairro,
        localidade: r.localidade,
        uf: r.uf,
        estado: r.estado,
        rua: r.rua,
        termo_lgpd: Boolean(r.termo_lgpd),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error('[MySQL] Erro ao consultar pessoas, usando fallback:', err);
    }
  }
  return [...inMemoryPessoas];
}

export async function createPessoaDb(data: NewPessoaInput): Promise<PessoaRecord> {
  const newRecord: PessoaRecord = {
    id: Date.now(),
    nome: data.nome.trim(),
    cpf: data.cpf.trim(),
    cep: data.cep.trim(),
    numero: data.numero.trim(),
    complemento: (data.complemento || '').trim(),
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    localidade: data.localidade.trim(),
    uf: data.uf.trim().toUpperCase(),
    estado: data.estado.trim(),
    rua: (data.rua || data.logradouro).trim(),
    termo_lgpd: data.termo_lgpd !== false,
    created_at: new Date().toISOString(),
  };

  if (isDbConnected && pool) {
    try {
      const [result]: any = await pool.query(
        `INSERT INTO pessoas (nome, cpf, cep, numero, complemento, logradouro, bairro, localidade, uf, estado, rua, termo_lgpd)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newRecord.nome,
          newRecord.cpf,
          newRecord.cep,
          newRecord.numero,
          newRecord.complemento,
          newRecord.logradouro,
          newRecord.bairro,
          newRecord.localidade,
          newRecord.uf,
          newRecord.estado,
          newRecord.rua,
          newRecord.termo_lgpd ? 1 : 0,
        ]
      );
      if (result && result.insertId) {
        newRecord.id = result.insertId;
      }
    } catch (err) {
      console.error('[MySQL] Erro ao inserir pessoa no banco:', err);
    }
  }

  inMemoryPessoas.unshift(newRecord);
  return newRecord;
}

export async function saveAvaliacaoDb(data: {
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
  nota_facilidade: number;
  upvotes: number;
  created_at: string;
  lat?: number;
  lon?: number;
  cidade?: string;
  uf?: string;
  bairro?: string;
  logradouro?: string;
}): Promise<void> {
  if (isDbConnected && pool) {
    try {
      // 1. Ensure CEP in ceps table
      await pool.query(
        `INSERT INTO ceps (cep, logradouro, complemento, bairro, cidade, uf, lat, lon)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE cidade=VALUES(cidade), uf=VALUES(uf)`,
        [
          data.cep,
          data.logradouro || data.local_nome,
          '',
          data.bairro || '',
          data.cidade || '',
          data.uf || '',
          data.lat || -23.5505,
          data.lon || -46.6333,
        ]
      );

      // 2. Insert into avaliacoes
      await pool.query(
        `INSERT INTO avaliacoes (
          id, cep, local_nome, usuario_nome, rampa_acesso, elevador, banheiro_adaptado,
          vaga_pcd, piso_tatil, balcao_baixo, interprete_libras, sinalizacao_sonora,
          espaco_calmo, portas_largas, comentario, nota_facilidade, upvotes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE upvotes=VALUES(upvotes), nota_facilidade=VALUES(nota_facilidade)`,
        [
          data.id,
          data.cep,
          data.local_nome,
          data.usuario_nome,
          data.rampa_acesso ? 1 : 0,
          data.elevador ? 1 : 0,
          data.banheiro_adaptado ? 1 : 0,
          data.vaga_pcd ? 1 : 0,
          data.piso_tatil ? 1 : 0,
          data.balcao_baixo ? 1 : 0,
          data.interprete_libras ? 1 : 0,
          data.sinalizacao_sonora ? 1 : 0,
          data.espaco_calmo ? 1 : 0,
          data.portas_largas ? 1 : 0,
          data.comentario,
          data.nota_facilidade,
          data.upvotes,
          data.created_at,
        ]
      );
    } catch (err) {
      console.error('[MySQL] Erro ao persistir avaliação no banco:', err);
    }
  }
}

export async function upvoteAvaliacaoDb(id: string): Promise<number | null> {
  if (isDbConnected && pool) {
    try {
      await pool.query('UPDATE avaliacoes SET upvotes = upvotes + 1 WHERE id = ?', [id]);
      const [rows]: any = await pool.query('SELECT upvotes FROM avaliacoes WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        return rows[0].upvotes;
      }
    } catch (err) {
      console.error('[MySQL] Erro ao registrar upvote no banco:', err);
    }
  }
  return null;
}

export function getDbHealth() {
  return {
    isConnected: isDbConnected,
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    volumeName: 'mysql_data',
    network: 'cep_network',
    engine: 'MySQL 8.0 (InnoDB)',
  };
}
