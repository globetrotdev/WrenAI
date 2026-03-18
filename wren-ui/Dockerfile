FROM node:18-bookworm-slim AS base

# Install required packages
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app

# Enable corepack to manage yarn versions
RUN corepack enable
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn/releases/yarn-4.5.3.cjs .yarn/releases/yarn-4.5.3.cjs
RUN corepack prepare yarn@4.5.3 --activate

# ----------------------------------------
FROM base AS deps
WORKDIR /app
# Install dependencies (sharp should now be in your package.json!)
RUN yarn install --immutable

# ----------------------------------------
FROM base AS builder
WORKDIR /app
# Copy the installed modules AND the updated Yarn state
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn

# Copy the ENTIRE project (respecting .dockerignore)
# This ensures no types/ or config folders are left behind!
COPY . .

# Now we build
RUN yarn build

# ----------------------------------------
FROM base AS runner
WORKDIR /app
# Set production environment ONLY at runtime
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

COPY --from=builder /app/public ./public
RUN mkdir .next

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY migrations ./migrations
COPY knexfile.js ./knexfile.js

# Copy knex and its dependencies
COPY --from=builder /app/node_modules/knex ./node_modules/knex
COPY --from=builder /app/node_modules/rechoir ./node_modules/rechoir
COPY --from=builder /app/node_modules/resolve ./node_modules/resolve
COPY --from=builder /app/node_modules/is-core-module ./node_modules/is-core-module
COPY --from=builder /app/node_modules/hasown ./node_modules/hasown
COPY --from=builder /app/node_modules/function-bind ./node_modules/function-bind
COPY --from=builder /app/node_modules/interpret ./node_modules/interpret
COPY --from=builder /app/node_modules/resolve-from ./node_modules/resolve-from
COPY --from=builder /app/node_modules/tildify ./node_modules/tildify
COPY --from=builder /app/node_modules/getopts ./node_modules/getopts
COPY --from=builder /app/node_modules/escalade/sync ./node_modules/escalade/sync
COPY --from=builder /app/node_modules/.yarn-state.yml ./node_modules/.yarn-state.yml

CMD yarn knex migrate:latest && HOSTNAME="0.0.0.0" node server.js