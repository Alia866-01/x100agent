-- ClickHouse Schema для AI-01 Analytics
-- Database для real-time аналитики агентов

-- Создать базу данных
CREATE DATABASE IF NOT EXISTS ai01;

USE ai01;

-- ==========================================
-- Таблица: agent_events
-- Логирование всех событий агентов
-- ==========================================
CREATE TABLE IF NOT EXISTS agent_events (
    event_id UUID,
    tenant_id UUID,
    agent_id UUID,
    event_type String,  -- 'message', 'tool_use', 'error', 'session_start', 'session_end'
    event_data String,  -- JSON string с дополнительными данными
    timestamp DateTime64(3),
    event_date Date DEFAULT toDate(timestamp)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (tenant_id, agent_id, timestamp)
SETTINGS index_granularity = 8192;

-- ==========================================
-- Таблица: message_metrics
-- Детальные метрики по сообщениям
-- ==========================================
CREATE TABLE IF NOT EXISTS message_metrics (
    message_id UUID,
    tenant_id UUID,
    agent_id UUID,
    conversation_id UUID,

    -- Message info
    sender Enum8('user' = 1, 'agent' = 2),
    message_length UInt32,
    response_time_ms UInt32,

    -- LLM info
    model_used String,
    tokens_input UInt32,
    tokens_output UInt32,
    tokens_total UInt32,
    cost_usd Float32,

    -- Features used
    tools_called Array(String),
    rag_retrieved UInt8,  -- 0 or 1 (boolean)
    rag_chunks_used UInt16,

    -- Timestamps
    timestamp DateTime64(3),
    event_date Date DEFAULT toDate(timestamp)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (tenant_id, agent_id, timestamp)
SETTINGS index_granularity = 8192;

-- ==========================================
-- Таблица: tool_usage
-- Статистика использования инструментов (Composio)
-- ==========================================
CREATE TABLE IF NOT EXISTS tool_usage (
    tool_id UUID,
    tenant_id UUID,
    agent_id UUID,
    message_id UUID,

    tool_name String,  -- 'gmail', 'calendar', 'crm'
    tool_action String,  -- 'send_email', 'create_event', etc
    execution_time_ms UInt32,
    success UInt8,  -- 0 or 1
    error_message String,

    timestamp DateTime64(3),
    event_date Date DEFAULT toDate(timestamp)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (tenant_id, agent_id, timestamp)
SETTINGS index_granularity = 8192;

-- ==========================================
-- Таблица: knowledge_base_metrics
-- Метрики по Knowledge Base (RAG)
-- ==========================================
CREATE TABLE IF NOT EXISTS knowledge_base_metrics (
    query_id UUID,
    tenant_id UUID,
    agent_id UUID,
    message_id UUID,

    query_text String,
    chunks_retrieved UInt16,
    avg_similarity Float32,
    processing_time_ms UInt32,

    timestamp DateTime64(3),
    event_date Date DEFAULT toDate(timestamp)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (tenant_id, agent_id, timestamp)
SETTINGS index_granularity = 8192;

-- ==========================================
-- Материализованное представление: agent_stats_daily
-- Агрегированная статистика по агентам (день)
-- ==========================================
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_stats_daily
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (tenant_id, agent_id, event_date)
AS SELECT
    tenant_id,
    agent_id,
    toDate(timestamp) as event_date,

    -- Message metrics
    count() as total_messages,
    countIf(sender = 'user') as user_messages,
    countIf(sender = 'agent') as agent_messages,

    -- Response metrics
    avg(response_time_ms) as avg_response_time_ms,
    quantile(0.95)(response_time_ms) as p95_response_time_ms,

    -- Token metrics
    sum(tokens_input) as total_tokens_input,
    sum(tokens_output) as total_tokens_output,
    sum(tokens_total) as total_tokens,

    -- Cost
    sum(cost_usd) as total_cost_usd,

    -- Feature usage
    countIf(arrayLength(tools_called) > 0) as messages_with_tools,
    countIf(rag_retrieved = 1) as messages_with_rag

FROM message_metrics
GROUP BY tenant_id, agent_id, event_date;

-- ==========================================
-- Материализованное представление: agent_stats_hourly
-- Агрегированная статистика по агентам (час)
-- ==========================================
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_stats_hourly
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (tenant_id, agent_id, event_hour)
AS SELECT
    tenant_id,
    agent_id,
    toStartOfHour(timestamp) as event_hour,
    toDate(timestamp) as event_date,

    count() as total_messages,
    avg(response_time_ms) as avg_response_time_ms,
    sum(tokens_total) as total_tokens,
    sum(cost_usd) as total_cost_usd

FROM message_metrics
GROUP BY tenant_id, agent_id, event_hour, event_date;

-- ==========================================
-- Таблица: user_sessions
-- Tracking пользовательских сессий (для analytics)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID,
    tenant_id UUID,
    user_id UUID,

    -- Session info
    session_start DateTime64(3),
    session_end DateTime64(3),
    duration_minutes UInt32,

    -- Activity
    pages_viewed UInt32,
    agents_created UInt16,
    messages_sent UInt32,

    -- Device info
    user_agent String,
    device_type Enum8('desktop' = 1, 'mobile' = 2, 'tablet' = 3),
    browser String,

    timestamp DateTime64(3),
    event_date Date DEFAULT toDate(timestamp)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (tenant_id, user_id, timestamp)
SETTINGS index_granularity = 8192;

-- ==========================================
-- Indexes для оптимизации запросов
-- ==========================================

-- Index для быстрого поиска по agent_id
ALTER TABLE message_metrics
    ADD INDEX idx_agent_id agent_id TYPE bloom_filter GRANULARITY 1;

-- Index для быстрого поиска по conversation_id
ALTER TABLE message_metrics
    ADD INDEX idx_conversation_id conversation_id TYPE bloom_filter GRANULARITY 1;

-- ==========================================
-- Примеры запросов для analytics
-- ==========================================

-- Статистика агента за последние 7 дней
-- SELECT
--     event_date,
--     total_messages,
--     avg_response_time_ms,
--     total_tokens,
--     total_cost_usd,
--     messages_with_rag,
--     messages_with_tools
-- FROM agent_stats_daily
-- WHERE tenant_id = '...'
--   AND agent_id = '...'
--   AND event_date >= today() - 7
-- ORDER BY event_date DESC;

-- Топ используемых инструментов
-- SELECT
--     tool_name,
--     count() as usage_count,
--     avg(execution_time_ms) as avg_execution_time,
--     countIf(success = 1) / count() as success_rate
-- FROM tool_usage
-- WHERE tenant_id = '...'
--   AND event_date >= today() - 30
-- GROUP BY tool_name
-- ORDER BY usage_count DESC;

-- Hourly message volume (для графиков)
-- SELECT
--     event_hour,
--     sum(total_messages) as messages
-- FROM agent_stats_hourly
-- WHERE tenant_id = '...'
--   AND agent_id = '...'
--   AND event_hour >= now() - INTERVAL 24 HOUR
-- GROUP BY event_hour
-- ORDER BY event_hour;
