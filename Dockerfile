FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files (no lock file — regenerate for Linux)
COPY package.json ./

# Install dependencies fresh for Linux
RUN npm install

# Copy source
COPY . .

# Build (VITE_ vars passed as build args)
ARG VITE_TG_BOT_TOKEN
ARG VITE_TG_CHAT_ID
ARG VITE_TG_BOT_USERNAME
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ADMIN_PASSWORD

ENV VITE_TG_BOT_TOKEN=$VITE_TG_BOT_TOKEN
ENV VITE_TG_CHAT_ID=$VITE_TG_CHAT_ID
ENV VITE_TG_BOT_USERNAME=$VITE_TG_BOT_USERNAME
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_ADMIN_PASSWORD=$VITE_ADMIN_PASSWORD

RUN npm run build

# Serve with lightweight HTTP server
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD serve -s dist -l ${PORT:-3000}
