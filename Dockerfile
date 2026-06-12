# syntax=docker/dockerfile:1

# ============================================================================
# DakarEaseU — Dockerfile pour apps/admin (Next.js)
#
# Pourquoi ce choix : DakarEaseU est 100% Supabase-centré, sans backend custom à
# déployer (cf. docs/architecture-cible.md). Le seul artefact "serveur" du repo
# est le dashboard admin Next.js, dont l'hébergement principal est Vercel (cf.
# .github/workflows/deploy-admin.yml). Cette image sert de :
#   1. Parité locale : reproduire l'environnement de build/run exact sans Vercel ;
#   2. Filet de secours d'auto-hébergement si Vercel devient indisponible/inadapté.
# Build multi-stage : deps → build → runtime, basé sur node:20-alpine (petite
# image), utilisateur non-root, sortie Next.js "standalone" pour un runtime minimal.
#
# Build :  docker build -t dakareaseu-admin .
# Run   :  docker run -p 3000:3000 --env-file .env dakareaseu-admin
# ============================================================================

# ---- Stage 1 : deps — installe uniquement les dépendances nécessaires au build ----
FROM node:20-alpine AS deps
WORKDIR /repo

# Copie des manifests du monorepo pour profiter du cache Docker des dépendances
COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN npm ci --workspace=@dakareaseu/admin --workspace=@dakareaseu/shared --workspace=@dakareaseu/types --include-workspace-root

# ---- Stage 2 : builder — construit l'app Next.js en mode standalone ----
FROM node:20-alpine AS builder
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/package.json /repo/package-lock.json ./
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@dakareaseu/admin

# ---- Stage 3 : runtime — image minimale, ne contient que le strict nécessaire ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Utilisateur non-root (bonne pratique de sécurité)
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Sortie Next.js "standalone" : un server.js autonome + le minimum de node_modules
# (nécessite `output: 'standalone'` dans apps/admin/next.config.js — posé par le
# plan admin-dashboard ; si absent, ce build échoue avec "Cannot find module server.js").
COPY --from=builder --chown=nextjs:nodejs /repo/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/admin/public ./apps/admin/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/admin/server.js"]
