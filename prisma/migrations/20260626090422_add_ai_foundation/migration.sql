-- CreateEnum
CREATE TYPE "AiChannel" AS ENUM ('STOREFRONT', 'ADMIN', 'ACCOUNT', 'API');

-- CreateEnum
CREATE TYPE "AiConversationStatus" AS ENUM ('ACTIVE', 'AWAITING_HUMAN', 'HANDED_OFF', 'RESOLVED', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AiPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('SYSTEM', 'DEVELOPER', 'USER', 'ASSISTANT', 'TOOL');

-- CreateEnum
CREATE TYPE "AiToolCategory" AS ENUM ('PRODUCT', 'ORDER', 'KNOWLEDGE', 'CUSTOMER', 'SUPPORT', 'ADMIN_ANALYST');

-- CreateEnum
CREATE TYPE "AiToolCallStatus" AS ENUM ('PENDING', 'SUCCESS', 'ERROR', 'DENIED', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AiHandoffStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiFeedbackRating" AS ENUM ('UP', 'DOWN');

-- CreateEnum
CREATE TYPE "AiKnowledgeType" AS ENUM ('PRODUCT', 'CATEGORY', 'PRODUCT_ATTRIBUTE', 'REVIEW_SUMMARY', 'FAQ', 'POLICY', 'ABOUT', 'SHIPPING', 'RETURNS', 'POST', 'RECIPE', 'SUPPORT_MACRO', 'BRAND_TONE', 'GUIDE');

-- CreateEnum
CREATE TYPE "AiKnowledgeStatus" AS ENUM ('ACTIVE', 'STALE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AiOperation" AS ENUM ('RESPONSE', 'RESPONSE_STREAM', 'EMBEDDING', 'MODERATION', 'STRUCTURED', 'ADMIN_REPORT', 'TITLE');

-- CreateEnum
CREATE TYPE "AiGuardrailType" AS ENUM ('MODERATION_INPUT', 'MODERATION_OUTPUT', 'PII_MASK', 'RATE_LIMIT', 'TOOL_DENIED', 'PROMPT_INJECTION', 'APPROVAL_REQUIRED', 'OUTPUT_BLOCKED');

-- CreateEnum
CREATE TYPE "AiGuardrailAction" AS ENUM ('ALLOWED', 'BLOCKED', 'MASKED', 'FLAGGED', 'THROTTLED');

-- CreateEnum
CREATE TYPE "AiReportStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "AiSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'QUICK_WIN', 'INFO');

-- CreateEnum
CREATE TYPE "AiFindingStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "channel" "AiChannel" NOT NULL DEFAULT 'STOREFRONT',
    "status" "AiConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionId" TEXT,
    "visitorId" TEXT,
    "customerId" TEXT,
    "operatorId" TEXT,
    "intent" TEXT,
    "priority" "AiPriority" NOT NULL DEFAULT 'NORMAL',
    "title" TEXT,
    "language" TEXT NOT NULL DEFAULT 'fa',
    "lastResponseId" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "channel" "AiChannel" NOT NULL DEFAULT 'STOREFRONT',
    "visitorId" TEXT,
    "customerId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "contentJson" JSONB,
    "model" TEXT,
    "providerResponseId" TEXT,
    "tokensInput" INTEGER,
    "tokensOutput" INTEGER,
    "latencyMs" INTEGER,
    "moderationFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AiToolCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "parametersJson" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "readOnly" BOOLEAN NOT NULL DEFAULT true,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "isDestructive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_calls" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT,
    "toolName" TEXT NOT NULL,
    "providerCallId" TEXT,
    "argumentsJson" JSONB,
    "resultJson" JSONB,
    "status" "AiToolCallStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "latencyMs" INTEGER,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_tool_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_handoffs" (
    "id" TEXT NOT NULL,
    "aiConversationId" TEXT NOT NULL,
    "conversationId" TEXT,
    "reason" TEXT,
    "summary" TEXT,
    "status" "AiHandoffStatus" NOT NULL DEFAULT 'REQUESTED',
    "priority" "AiPriority" NOT NULL DEFAULT 'NORMAL',
    "operatorId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_handoffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedback" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT,
    "rating" "AiFeedbackRating" NOT NULL,
    "comment" TEXT,
    "visitorId" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_knowledge_sources" (
    "id" TEXT NOT NULL,
    "type" "AiKnowledgeType" NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "status" "AiKnowledgeStatus" NOT NULL DEFAULT 'ACTIVE',
    "documentCount" INTEGER NOT NULL DEFAULT 0,
    "lastIndexedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_vector_documents" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceType" "AiKnowledgeType" NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "contentHash" TEXT,
    "metadataJson" JSONB,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_vector_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_vector_chunks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "embedding" DOUBLE PRECISION[],
    "embeddingModel" TEXT,
    "dim" INTEGER,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_vector_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_admin_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "AiReportStatus" NOT NULL DEFAULT 'PENDING',
    "executiveSummary" TEXT,
    "scopeJson" JSONB,
    "modules" TEXT[],
    "model" TEXT,
    "tokensInput" INTEGER NOT NULL DEFAULT 0,
    "tokensOutput" INTEGER NOT NULL DEFAULT 0,
    "generatedById" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_admin_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_admin_findings" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "severity" "AiSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceJson" JSONB,
    "recommendation" TEXT NOT NULL,
    "suggestedAction" TEXT,
    "status" "AiFindingStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_admin_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_guardrail_events" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "type" "AiGuardrailType" NOT NULL,
    "action" "AiGuardrailAction" NOT NULL,
    "severity" "AiSeverity",
    "detailsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_guardrail_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "operation" "AiOperation" NOT NULL,
    "model" TEXT NOT NULL,
    "tokensInput" INTEGER NOT NULL DEFAULT 0,
    "tokensOutput" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "costMicroUsd" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_error_logs" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "operation" "AiOperation",
    "model" TEXT,
    "code" TEXT,
    "message" TEXT NOT NULL,
    "detailsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_conversations_channel_idx" ON "ai_conversations"("channel");

-- CreateIndex
CREATE INDEX "ai_conversations_status_idx" ON "ai_conversations"("status");

-- CreateIndex
CREATE INDEX "ai_conversations_visitorId_idx" ON "ai_conversations"("visitorId");

-- CreateIndex
CREATE INDEX "ai_conversations_customerId_idx" ON "ai_conversations"("customerId");

-- CreateIndex
CREATE INDEX "ai_conversations_operatorId_idx" ON "ai_conversations"("operatorId");

-- CreateIndex
CREATE INDEX "ai_conversations_sessionId_idx" ON "ai_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "ai_conversations_lastMessageAt_idx" ON "ai_conversations"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_sessions_token_key" ON "ai_sessions"("token");

-- CreateIndex
CREATE INDEX "ai_sessions_token_idx" ON "ai_sessions"("token");

-- CreateIndex
CREATE INDEX "ai_sessions_visitorId_idx" ON "ai_sessions"("visitorId");

-- CreateIndex
CREATE INDEX "ai_sessions_customerId_idx" ON "ai_sessions"("customerId");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_idx" ON "ai_messages"("conversationId");

-- CreateIndex
CREATE INDEX "ai_messages_role_idx" ON "ai_messages"("role");

-- CreateIndex
CREATE INDEX "ai_messages_createdAt_idx" ON "ai_messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tools_name_key" ON "ai_tools"("name");

-- CreateIndex
CREATE INDEX "ai_tools_category_idx" ON "ai_tools"("category");

-- CreateIndex
CREATE INDEX "ai_tools_enabled_idx" ON "ai_tools"("enabled");

-- CreateIndex
CREATE INDEX "ai_tool_calls_conversationId_idx" ON "ai_tool_calls"("conversationId");

-- CreateIndex
CREATE INDEX "ai_tool_calls_toolName_idx" ON "ai_tool_calls"("toolName");

-- CreateIndex
CREATE INDEX "ai_tool_calls_status_idx" ON "ai_tool_calls"("status");

-- CreateIndex
CREATE INDEX "ai_tool_calls_createdAt_idx" ON "ai_tool_calls"("createdAt");

-- CreateIndex
CREATE INDEX "ai_handoffs_aiConversationId_idx" ON "ai_handoffs"("aiConversationId");

-- CreateIndex
CREATE INDEX "ai_handoffs_conversationId_idx" ON "ai_handoffs"("conversationId");

-- CreateIndex
CREATE INDEX "ai_handoffs_status_idx" ON "ai_handoffs"("status");

-- CreateIndex
CREATE INDEX "ai_feedback_conversationId_idx" ON "ai_feedback"("conversationId");

-- CreateIndex
CREATE INDEX "ai_feedback_rating_idx" ON "ai_feedback"("rating");

-- CreateIndex
CREATE INDEX "ai_knowledge_sources_type_idx" ON "ai_knowledge_sources"("type");

-- CreateIndex
CREATE INDEX "ai_knowledge_sources_status_idx" ON "ai_knowledge_sources"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ai_knowledge_sources_type_externalId_key" ON "ai_knowledge_sources"("type", "externalId");

-- CreateIndex
CREATE INDEX "ai_vector_documents_sourceId_idx" ON "ai_vector_documents"("sourceId");

-- CreateIndex
CREATE INDEX "ai_vector_documents_sourceType_idx" ON "ai_vector_documents"("sourceType");

-- CreateIndex
CREATE INDEX "ai_vector_chunks_documentId_idx" ON "ai_vector_chunks"("documentId");

-- CreateIndex
CREATE INDEX "ai_admin_reports_status_idx" ON "ai_admin_reports"("status");

-- CreateIndex
CREATE INDEX "ai_admin_reports_createdAt_idx" ON "ai_admin_reports"("createdAt");

-- CreateIndex
CREATE INDEX "ai_admin_findings_reportId_idx" ON "ai_admin_findings"("reportId");

-- CreateIndex
CREATE INDEX "ai_admin_findings_severity_idx" ON "ai_admin_findings"("severity");

-- CreateIndex
CREATE INDEX "ai_admin_findings_status_idx" ON "ai_admin_findings"("status");

-- CreateIndex
CREATE INDEX "ai_admin_findings_module_idx" ON "ai_admin_findings"("module");

-- CreateIndex
CREATE INDEX "ai_guardrail_events_conversationId_idx" ON "ai_guardrail_events"("conversationId");

-- CreateIndex
CREATE INDEX "ai_guardrail_events_type_idx" ON "ai_guardrail_events"("type");

-- CreateIndex
CREATE INDEX "ai_guardrail_events_createdAt_idx" ON "ai_guardrail_events"("createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_logs_conversationId_idx" ON "ai_usage_logs"("conversationId");

-- CreateIndex
CREATE INDEX "ai_usage_logs_operation_idx" ON "ai_usage_logs"("operation");

-- CreateIndex
CREATE INDEX "ai_usage_logs_model_idx" ON "ai_usage_logs"("model");

-- CreateIndex
CREATE INDEX "ai_usage_logs_createdAt_idx" ON "ai_usage_logs"("createdAt");

-- CreateIndex
CREATE INDEX "ai_error_logs_conversationId_idx" ON "ai_error_logs"("conversationId");

-- CreateIndex
CREATE INDEX "ai_error_logs_createdAt_idx" ON "ai_error_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_calls" ADD CONSTRAINT "ai_tool_calls_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_calls" ADD CONSTRAINT "ai_tool_calls_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ai_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_handoffs" ADD CONSTRAINT "ai_handoffs_aiConversationId_fkey" FOREIGN KEY ("aiConversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_vector_documents" ADD CONSTRAINT "ai_vector_documents_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ai_knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_vector_chunks" ADD CONSTRAINT "ai_vector_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ai_vector_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_admin_findings" ADD CONSTRAINT "ai_admin_findings_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ai_admin_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

