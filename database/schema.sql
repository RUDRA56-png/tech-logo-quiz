-- ============================================================
-- Tech Logo Quiz Game - Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS tech_logo_quiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tech_logo_quiz;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER', -- USER | ADMIN
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- ============================================================
-- QUIZ QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    logo_url VARCHAR(500) NOT NULL,
    company_name VARCHAR(100) NOT NULL,  -- correct answer reference
    option1 VARCHAR(100) NOT NULL,
    option2 VARCHAR(100) NOT NULL,
    option3 VARCHAR(100) NOT NULL,
    option4 VARCHAR(100) NOT NULL,
    correct_answer VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'MEDIUM', -- EASY | MEDIUM | HARD
    category VARCHAR(50) DEFAULT 'TECH',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SCORES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,                  -- NULL for guests
    guest_name VARCHAR(100),              -- for guest players
    score INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 10,
    correct_answers INT NOT NULL DEFAULT 0,
    time_taken INT,                       -- seconds
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_score (score DESC),
    INDEX idx_played_at (played_at DESC)
);

-- ============================================================
-- SEED DATA - Quiz Questions (Using CDN logo URLs)
-- ============================================================
INSERT INTO quiz_questions (logo_url, company_name, option1, option2, option3, option4, correct_answer, difficulty) VALUES
-- Easy
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',       'React',      'React',      'Angular',    'Vue',        'Svelte',     'React',      'EASY'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',     'Python',     'Ruby',       'Python',     'Perl',       'Swift',      'Python',     'EASY'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', 'JavaScript', 'TypeScript', 'CoffeeScript', 'JavaScript', 'Dart',     'JavaScript', 'EASY'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',         'Java',       'Kotlin',     'Scala',      'Java',       'Groovy',     'Java',       'EASY'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',     'Docker',     'Podman',     'Kubernetes', 'Docker',     'Vagrant',    'Docker',     'EASY'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',           'Git',        'Git',        'SVN',        'Mercurial',  'Bazaar',     'Git',        'EASY'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',       'Linux',      'Windows',    'macOS',      'Linux',      'FreeBSD',    'Linux',      'EASY'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',       'MySQL',      'PostgreSQL', 'MySQL',      'SQLite',     'MariaDB',    'MySQL',      'EASY'),
-- Medium
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg','Kubernetes', 'OpenShift',  'Kubernetes', 'Nomad',      'Mesos',      'Kubernetes', 'MEDIUM'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg','TypeScript','Flow',     'TypeScript', 'ReScript',   'Elm',        'TypeScript', 'MEDIUM'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',   'MongoDB',    'CouchDB',    'MongoDB',    'RavenDB',    'DynamoDB',   'MongoDB',    'MEDIUM'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',       'Redis',      'Memcached',  'Hazelcast',  'Redis',      'Cassandra',  'Redis',      'MEDIUM'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',       'Nginx',      'Apache',     'Nginx',      'Caddy',      'Traefik',    'Nginx',      'MEDIUM'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',      'GraphQL',    'REST',       'gRPC',       'GraphQL',    'SOAP',       'GraphQL',    'MEDIUM'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',       'Vue.js',     'React',      'Angular',    'Vue.js',     'Ember',      'Vue.js',     'MEDIUM'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg','Angular',   'Angular',    'Backbone',   'Knockout',   'Aurelia',    'Angular',    'MEDIUM'),
-- Hard
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg',            'Rust',       'Go',         'Zig',        'Rust',       'Nim',        'Rust',       'HARD'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elixir/elixir-original.svg',     'Elixir',     'Erlang',     'Elixir',     'Phoenix',    'Clojure',    'Elixir',     'HARD'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg','Terraform', 'Pulumi',     'Ansible',    'Terraform',  'Chef',       'Terraform',  'HARD'),
('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',   'Flutter',    'React Native','Ionic',     'Flutter',    'Xamarin',    'Flutter',    'HARD');

-- ============================================================
-- SEED ADMIN USER (password: Admin@123 -> bcrypt)
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'avyakti@.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7i', 'ADMIN');

-- ============================================================
-- Useful views
-- ============================================================
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
    ROW_NUMBER() OVER (ORDER BY s.score DESC, s.played_at ASC) AS rank_pos,
    COALESCE(u.name, s.guest_name, 'Guest') AS player_name,
    s.score,
    s.correct_answers,
    s.total_questions,
    s.time_taken,
    s.played_at,
    CASE WHEN s.user_id IS NOT NULL THEN 'registered' ELSE 'guest' END AS player_type
FROM scores s
LEFT JOIN users u ON s.user_id = u.id
ORDER BY s.score DESC, s.played_at ASC
LIMIT 100;
