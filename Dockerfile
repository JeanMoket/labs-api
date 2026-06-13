# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app

# deps
COPY package*.json ./
RUN npm ci

# prisma schema + generate (IMPORTANT)
COPY prisma ./prisma
RUN npx prisma generate

# source + build
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# install prod deps (includes @prisma/client)
COPY package*.json ./
RUN npm ci --omit=dev

# copy prisma folder + generated client engine bits
COPY prisma ./prisma
# regenerate in runtime image too (safe & simple)
RUN npx prisma generate

COPY prisma.config.ts ./
# copy compiled app
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
