# ═══════════════════════════════════════════════════════════════════════════
# DOCKERFILE - Restaurant App Server
# 
# Multi-stage build pentru optimizare
# ═══════════════════════════════════════════════════════════════════════════

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend files
COPY admin-vite/package*.json ./admin-vite/
RUN cd admin-vite && npm ci --only=production

COPY admin-vite ./admin-vite
RUN cd admin-vite && npm run build

# Stage 2: Production
FROM node:18-alpine

# Install dependencies for production
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/admin-vite/dist ./admin-vite/dist

# Create data directory for SQLite and queue backups
RUN mkdir -p /app/data /app/logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV TZ=Europe/Bucharest

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run application
CMD ["node", "server.js"]
