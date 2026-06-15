# syntax=docker/dockerfile:1

# ──────────────────────────────────────────
# Stage 1: deps — install all dependencies
# ──────────────────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Copy manifests only (cache-friendly layer).
# bun.loc[k] is an optional-glob so the COPY doesn't fail when bun.lock hasn't
# been committed yet (bun install will generate it fresh).
COPY package.json bun.loc[k] ./

# bun install without --frozen-lockfile because there is no committed lockfile.
# sharp's platform binary (musl) is downloaded here too once sharp is added to
# package.json by the orchestrator.
RUN bun install


# ──────────────────────────────────────────
# Stage 2: builder — compile the Next.js app
# ──────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Bring in node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Public URLs are inlined into the client bundle at build time (NEXT_PUBLIC_*).
# Passed as build args from compose so absolute links use the real domain.
ARG NEXT_PUBLIC_APP_URL=
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# src/lib/stripe/server.ts throws at module-init time when STRIPE_SECRET_KEY is
# absent — next build imports server modules while collecting page data, so the
# build crashes without this. Supply a harmless placeholder; the real key is
# injected at runtime via the container's STRIPE_SECRET_KEY env var.
ENV STRIPE_SECRET_KEY=build-time-placeholder-not-used-in-prod

# DATABASE_URL may be read at module scope once the Postgres migration lands.
# Pre-emptively supply a placeholder for the same reason as STRIPE_SECRET_KEY.
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

RUN bun --bun next build


# ──────────────────────────────────────────
# Stage 3: runner — minimal production image
# ──────────────────────────────────────────
# Next.js standalone output runs `node server.js`, so we use Node rather than
# Bun here (Bun isn't needed post-build, and node:22-alpine is a smaller base).
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy standalone server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets into the standalone tree where Next.js expects them
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ── Native module fixup — sharp ────────────────────────────────────────────────
# Next.js standalone tracing does not reliably copy native platform packages.
# Bun installs a flat node_modules (no .pnpm store), so paths are straightforward.
#
# ASSUMPTION: sharp must be present in package.json before this image builds.
# If sharp is absent from package.json the COPY lines below will error.
# The orchestrator must run: bun add sharp
#
# sharp: copy the main package and all @img/* scoped platform packages
# (@img/sharp-linux-musl-x64 / @img/sharp-linux-musl-arm64 are installed by
# bun based on the build platform; only the relevant one will be present).
RUN mkdir -p ./node_modules/@img
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@img  ./node_modules/@img

# Safety net: if bun installed a libvips-dependent sharp variant rather than the
# self-contained musl prebuilt, the .node binding needs the system libvips.
# This apk add is a no-op overhead (~2 MB) if the prebuilt is used.
RUN apk add --no-cache vips

# ── Persistent data directory ──────────────────────────────────────────────────
# Pre-create /app/data/uploads so Docker initialises the named volume mount
# with nextjs ownership instead of root:root (Docker copies the directory's
# ownership when it first creates the volume from the image layer).
RUN mkdir -p /app/data/uploads && chown -R nextjs:nodejs /app/data

EXPOSE 3000

USER nextjs

CMD ["node", "server.js"]
