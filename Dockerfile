# Multi-stage build for a static Vite React app served by Nginx

FROM node:18-alpine AS build
ENV CI=true
ENV NO_UPDATE_NOTIFIER=1
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
 && corepack use pnpm@10.17.0 \
 && pnpm --version \
 && pnpm install --no-frozen-lockfile

# Build
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS runner

# Copy custom nginx config for SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
