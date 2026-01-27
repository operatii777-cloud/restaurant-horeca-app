# ============================================
# 🐳 DOCKERFILE - RESTAURANT APP
# Multi-stage build pentru optimizare
# ============================================

# ============================================
# STAGE 1: Base
# ============================================
FROM node:20-alpine AS base

# Install dependencies only when needed
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    curl

WORKDIR /app

# ============================================
# STAGE 2: Dependencies
# ============================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --ignore-scripts

# Install all dependencies (including dev) for build
# Include Playwright and Puppeteer for PDF generation and testing
RUN npm ci --ignore-scripts && \
    npx playwright install chromium --with-deps || echo "Playwright install skipped" && \
    echo "✅ Dependencies installed"

# ============================================
# STAGE 3: Build (Frontend + Backend)
# ============================================
FROM dependencies AS build

# CRITICAL: FORCE COPY admin-vite/ with trailing slash to copy entire directory
# This bypasses .dockerignore completely
COPY admin-vite/ /app/admin-vite/

# Verify admin-vite was copied correctly (immediate check)
RUN echo "=== Verifying admin-vite was copied ===" && \
    ls -la /app/admin-vite/ 2>&1 && \
    test -d /app/admin-vite && echo "✅ admin-vite directory exists" || (echo "❌ admin-vite directory NOT FOUND!" && exit 1)

# CRITICAL: Explicitly copy audit/logs if it was excluded by .dockerignore
# This is a safety net to ensure logs folder is always present
COPY admin-vite/src/modules/audit/logs/ /app/admin-vite/src/modules/audit/logs/

# Verify audit/logs exists (the missing folder)
RUN echo "=== Verifying audit/logs folder ===" && \
    ls -la /app/admin-vite/src/modules/audit/ 2>&1 && \
    if [ -d /app/admin-vite/src/modules/audit/logs ]; then \
      echo "✅ audit/logs folder EXISTS"; \
      ls -la /app/admin-vite/src/modules/audit/logs/ 2>&1; \
      if [ -d /app/admin-vite/src/modules/audit/logs/pages ]; then \
        echo "✅ audit/logs/pages folder EXISTS"; \
        ls -la /app/admin-vite/src/modules/audit/logs/pages/ 2>&1; \
        find /app/admin-vite/src/modules/audit/logs -type f 2>&1; \
      else \
        echo "❌ audit/logs/pages folder MISSING!"; \
      fi; \
    else \
      echo "❌ audit/logs folder MISSING - attempting to create from source"; \
      mkdir -p /app/admin-vite/src/modules/audit/logs/pages; \
    fi

# Copy rest of server files
COPY server.js ./
COPY routes ./routes
COPY models ./models
COPY helpers ./helpers
COPY services ./services
COPY utils ./utils
COPY migrations ./migrations
COPY constants ./constants
COPY cron ./cron
COPY data ./data
COPY public ./public
COPY database.js ./
COPY database-protection.js ./
COPY database-enterprise-tables.js ./

# CRITICAL VERIFICATION: AuditLogsPage.tsx MUST exist
RUN echo "=== Final verification of AuditLogsPage.tsx ===" && \
    if [ -f /app/admin-vite/src/modules/audit/logs/pages/AuditLogsPage.tsx ]; then \
      echo "✅ AuditLogsPage.tsx VERIFIED"; \
      ls -lh /app/admin-vite/src/modules/audit/logs/pages/AuditLogsPage.tsx; \
    else \
      echo "❌ AuditLogsPage.tsx NOT FOUND - listing all audit files:"; \
      find /app/admin-vite/src/modules/audit -type f 2>&1; \
      echo "Checking if logs folder exists:"; \
      ls -la /app/admin-vite/src/modules/audit/ 2>&1; \
      exit 1; \
    fi

# Build admin-vite frontend (with all source files)
RUN cd /app/admin-vite && \
    npm install && \
    npm run build

# Rebuild sqlite3 for production
RUN npm rebuild sqlite3

# ============================================
# STAGE 4: Production
# ============================================
FROM base AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV TZ=Europe/Bucharest

# Create app user (security best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/public/documents /app/backups && \
    chown -R nodejs:nodejs /app

# Switch to app directory
WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code (including built admin-vite)
COPY --from=build --chown=nodejs:nodejs /app ./

# Copy SQLite database (if exists)
COPY --chown=nodejs:nodejs restaurant.db* ./

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Switch to non-root user
USER nodejs

# Start application
CMD ["node", "server.js"]

