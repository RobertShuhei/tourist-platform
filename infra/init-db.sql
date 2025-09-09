-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pgvector extension for AI-powered semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extensions are installed
SELECT extname FROM pg_extension WHERE extname IN ('postgis', 'vector');