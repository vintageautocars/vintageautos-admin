# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# VITE_* vars are baked into the client bundle at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun run build

# ── Stage 3: Nginx static server ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner
RUN apk add --no-cache wget
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
