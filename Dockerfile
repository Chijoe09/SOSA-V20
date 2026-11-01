FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_PI_SANDBOX=true
ENV NEXT_PUBLIC_PI_SANDBOX=$NEXT_PUBLIC_PI_SANDBOX
RUN npm run build
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node","server.js"]
