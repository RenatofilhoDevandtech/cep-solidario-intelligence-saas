-- ==========================================================
-- PROJETO: CEP SOLIDÁRIO & INTELLIGENCE SAAS
-- Criação de tabelas e dados de demonstração de CEP/acessibilidade.
-- Compatível com MySQL 8.0+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS cepsolidario_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE cepsolidario_db;

-- 1. TABELA DE ENDEREÇOS BASE E COORDENADAS
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cidade_uf (cidade, uf),
  INDEX idx_coordenadas (lat, lon)
) ENGINE=InnoDB;

-- 1.1 TABELA DE PESSOAS E ENDEREÇOS (REQUISITO OFICIAL / LGPD & PERSISTÊNCIA DOCKER)
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
  termo_lgpd BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pessoas_cpf (cpf),
  INDEX idx_pessoas_cep (cep)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE AVALIAÇÕES DE ACESSIBILIDADE PCD (CROWDSOURCING)
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
  nota_facilidade TINYINT UNSIGNED NOT NULL CHECK (nota_facilidade BETWEEN 1 AND 5),
  upvotes INT UNSIGNED DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cep) REFERENCES ceps(cep) ON DELETE CASCADE,
  INDEX idx_avaliacoes_cep (cep)
) ENGINE=InnoDB;

-- 3. TABELA DE FOTOS DE COMPROVAÇÃO DE ACESSIBILIDADE
CREATE TABLE IF NOT EXISTS fotos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avaliacao_id VARCHAR(64) NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. USUÁRIOS E CLIENTES B2B
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  empresa VARCHAR(200) DEFAULT NULL,
  stripe_customer_id VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. ASSINATURAS E PLANOS SAAS
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  plan ENUM('FREE', 'STARTUP', 'BUSINESS', 'ENTERPRISE') DEFAULT 'FREE',
  status ENUM('active', 'past_due', 'canceled') DEFAULT 'active',
  current_period_end TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. CHAVES DE API B2B COM RATE LIMITING
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  key_prefix VARCHAR(15) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  plan ENUM('FREE', 'STARTUP', 'BUSINESS', 'ENTERPRISE') NOT NULL,
  rate_limit INT UNSIGNED DEFAULT 60,
  requests_today INT UNSIGNED DEFAULT 0,
  requests_limit_today INT UNSIGNED DEFAULT 100,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. LOGS DE REQUISIÇÕES (ANALYTICS DE USO & LATÊNCIA)
CREATE TABLE IF NOT EXISTS requests_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  api_key_id VARCHAR(64) DEFAULT NULL,
  endpoint VARCHAR(100) NOT NULL,
  cep VARCHAR(9) NOT NULL,
  response_time_ms INT UNSIGNED NOT NULL,
  status INT NOT NULL,
  source VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_requests_cep (cep),
  INDEX idx_requests_time (timestamp)
) ENGINE=InnoDB;

-- 8. CACHE DE CEP (REDUÇÃO DE CUSTO COM APIS EXTERNAS)
CREATE TABLE IF NOT EXISTS cep_cache (
  cep VARCHAR(9) PRIMARY KEY,
  dados_json JSON NOT NULL,
  fonte VARCHAR(50) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. ANALYTICS DE ENTREGA E SCORE LOGÍSTICO
CREATE TABLE IF NOT EXISTS cep_analytics (
  cep VARCHAR(9) PRIMARY KEY,
  total_entregas INT UNSIGNED DEFAULT 0,
  taxa_sucesso DECIMAL(5, 2) DEFAULT 98.50,
  media_tempo_minutos INT UNSIGNED DEFAULT 24,
  score_qualidade TINYINT UNSIGNED DEFAULT 95,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- CEPs de referência para demonstração. Não são relatos de acessibilidade verificados.
-- ==========================================================

INSERT INTO ceps (cep, logradouro, complemento, bairro, cidade, uf, ibge, ddd, lat, lon)
VALUES 
  ('01310-100', 'Avenida Paulista', 'de 1000 a 1600', 'Bela Vista', 'São Paulo', 'SP', '3550308', '11', -23.56149200, -46.65588100),
  ('01310-930', 'Avenida Paulista', '2064', 'Cerqueira César', 'São Paulo', 'SP', '3550308', '11', -23.55980000, -46.66010000),
  ('01001-000', 'Praça da Sé', 'lado ímpar', 'Sé', 'São Paulo', 'SP', '3550308', '11', -23.55040000, -46.63390000),
  ('22041-001', 'Avenida Nossa Senhora de Copacabana', '', 'Copacabana', 'Rio de Janeiro', 'RJ', '3304557', '21', -22.96910000, -43.18690000),
  ('30130-100', 'Praça da Liberdade', '', 'Savassi', 'Belo Horizonte', 'MG', '3106200', '31', -19.93250000, -43.93720000),
  ('40026-280', 'Largo do Pelourinho', '', 'Pelourinho', 'Salvador', 'BA', '2927408', '71', -12.97180000, -38.50970000),
  ('70040-010', 'Esplanada dos Ministérios', 'Bloco A', 'Zona Cívico-Administrativa', 'Brasília', 'DF', '5300108', '61', -15.79980000, -47.86450000)
ON DUPLICATE KEY UPDATE logradouro=VALUES(logradouro);

