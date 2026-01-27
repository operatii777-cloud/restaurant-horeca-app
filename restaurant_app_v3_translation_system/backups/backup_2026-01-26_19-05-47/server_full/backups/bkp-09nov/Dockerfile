# ============================================
# 🐳 DOCKERFILE - RESTAURANT APP
# Multi-stage build pentru optimizare
# ============================================

# ============================================
# STAGE 1: Base
# ============================================
FROM node:18-alpine AS base

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
RUN npm ci --ignore-scripts

# ============================================
# STAGE 3: Build (if needed)
# ============================================
FROM dependencies AS build

COPY . .

# Run any build steps here (if needed)
# RUN npm run build

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

# Copy application code
COPY --chown=nodejs:nodejs . .

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

