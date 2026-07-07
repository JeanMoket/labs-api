# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
# placeholder so `prisma generate` (run via postinstall) can resolve its config;
# no DB connection is made at generate time, so a fake value is fine
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# prisma schema (needed by the postinstall hook that npm ci triggers)
COPY prisma ./prisma

# deps
COPY package*.json ./
RUN npm ci

# source + build
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# placeholder so `prisma generate` (run via postinstall) can resolve its config;
# overridden at container start by the real DATABASE_URL from env_file
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# prisma schema (needed by the postinstall hook that npm ci triggers)
COPY prisma ./prisma

# install prod deps (includes @prisma/client)
COPY package*.json ./
RUN npm ci --omit=dev

# copy compiled app
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
