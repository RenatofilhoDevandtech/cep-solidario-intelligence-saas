-- ==========================================================
-- PROJETO: CEP SOLIDÁRIO & INTELLIGENCE SAAS
-- Scripts de Criação de Tabelas (DDL) e Seeds Iniciais (DML)
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
-- SEEDS INICIAIS (DADOS DE EXEMPLO REAIS)
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

INSERT INTO avaliacoes (id, cep, local_nome, usuario_nome, rampa_acesso, elevador, banheiro_adaptado, vaga_pcd, piso_tatil, balcao_baixo, interprete_libras, sinalizacao_sonora, espaco_calmo, portas_largas, comentario, nota_facilidade, upvotes)
VALUES 
  ('av-1', '01310-100', 'MASP - Museu de Arte de São Paulo', 'Mariana Lima (Cadeirante)', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Acesso excelente por elevadores panorâmicos, banheiros totalmente acessíveis no subsolo e vão livre plano.', 5, 42),
  ('av-2', '01310-930', 'Shopping Center 3 & Estação Consolação', 'Carlos Eduardo (Guia Cão-Guia)', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, TRUE, 'Piso tátil bem demarcado conectando a calçada da Paulista ao saguão. Elevadores com aviso sonoro e braille nos botões.', 4, 28),
  ('av-3', '01001-000', 'Poupatempo Sé / Estação Sé', 'Ana Beatriz Souza', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, 'Atendimento prioritário exemplar. Balcão rebaixado para cadeirantes e intérprete de Libras disponível.', 5, 35),
  ('av-4', '22041-001', 'Clínica & Centro Comercial Copacabana', 'Roberto Silveira', TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Rampa de acesso suave na portaria, porém elevador estava temporariamente em manutenção no dia.', 3, 14),
  ('av-5', '30130-100', 'Centro Cultural Banco do Brasil BH (Praça da Liberdade)', 'Fernanda Martins', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Espaço 100% adaptado com rampas históricas integradas, plataformas de elevação e audioguias para pessoas cegas.', 5, 56)
ON DUPLICATE KEY UPDATE local_nome=VALUES(local_nome);

INSERT INTO fotos (avaliacao_id, url)
VALUES
  ('av-1', 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=600&auto=format&fit=crop&q=80'),
  ('av-5', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&auto=format&fit=crop&q=80');

INSERT INTO users (id, email, empresa, stripe_customer_id)
VALUES
  ('usr-demo-1', 'logistica@ecommercebrasil.com.br', 'E-commerce Brasil Log', 'cus_demo_98231'),
  ('usr-demo-2', 'dev@ongacessibilidade.org.br', 'Instituto Inclusão Urbana', 'cus_demo_free');

INSERT INTO subscriptions (id, user_id, plan, status)
VALUES
  ('sub-1', 'usr-demo-1', 'BUSINESS', 'active'),
  ('sub-2', 'usr-demo-2', 'FREE', 'active');

INSERT INTO api_keys (id, user_id, key_prefix, key_hash, name, plan, rate_limit, requests_today, requests_limit_today)
VALUES
  ('key-dev-demo', 'usr-demo-1', 'cs_live_9b4e', 'hash_live_sample', 'Checkout E-commerce Produção', 'BUSINESS', 300, 2841, 10000),
  ('key-test-env', 'usr-demo-2', 'cs_test_881f', 'hash_test_sample', 'Chave Teste / Sandbox', 'FREE', 60, 42, 100);
