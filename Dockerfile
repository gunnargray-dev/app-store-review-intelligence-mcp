# Stage 1: install all deps (incl. TypeScript) and compile.
FROM apify/actor-node:20 AS builder

COPY --chown=myuser:myuser package*.json ./
RUN npm ci --include=dev --audit=false --fund=false

COPY --chown=myuser:myuser tsconfig.json ./
COPY --chown=myuser:myuser src ./src
RUN npm run build

# Stage 2: production image with runtime deps only.
FROM apify/actor-node:20

COPY --chown=myuser:myuser package*.json ./
RUN npm ci --omit=dev --omit=optional --audit=false --fund=false \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" && node --version \
    && echo "NPM version:" && npm --version \
    && rm -rf ~/.npm

COPY --from=builder --chown=myuser:myuser /usr/src/app/dist ./dist
COPY --chown=myuser:myuser . ./

# Charge pay-per-event via Actor.charge() on the Apify platform.
ENV BILLING=apify

# Google Play (play-* billing events) is not priced on Apify yet: serve App Store only.

# Streamable HTTP mode. Under APIFY_IS_AT_HOME the server binds
# 0.0.0.0:$ACTOR_WEB_SERVER_PORT and serves MCP at /mcp.
CMD ["node", "dist/index.js", "--http"]
