# ==============================================================================
# Stage 1: Base Image
# Alpine lightweight Node.js 20 environment with libc compatibility
# ==============================================================================
FROM node:20-alpine AS base

# Install libc6-compat for compatibility with glibc-dependent modules on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ==============================================================================
# Stage 2: Dependencies Cache Layer
# Leverage Docker layer caching: only rerun when package manifests change
# ==============================================================================
FROM base AS deps

COPY package.json package-lock.json* ./
# Install exact dependencies matching package-lock.json with fallback
RUN npm ci --prefer-offline --no-audit || npm install --no-audit

# ==============================================================================
# Stage 3: Application Builder
# Compile Next.js in production standalone mode
# ==============================================================================
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry collection during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Configurable build argument for API Gateway / Backend URL
ARG BACKEND_URL=http://localhost:5000
ENV BACKEND_URL=${BACKEND_URL}

RUN npm run build

# ==============================================================================
# Stage 4: Production Runner (Lean, Secure, Non-Root)
# Minimal attack surface running as an unprivileged user
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged system user and group (UID/GID 1001) for container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and public directory
COPY --from=builder /app/public ./public

# Set proper permissions for Next.js prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Automatically leverage standalone output traces to minimize image size
# https://nextjs.org/docs/app/api-reference/next-config-js/output#automatically-copying-traced-files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to unprivileged user
USER nextjs

EXPOSE 3000

# Built-in health check using wget (included in Alpine) against the health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Launch the standalone Next.js server
CMD ["node", "server.js"]
