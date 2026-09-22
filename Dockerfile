# Production image for the PrathibhaLanka front end: Vite build served by nginx.
#
#   docker build -t prathibalanka-web .
#   docker run -p 8080:80 -e BACKEND_URL=http://host.docker.internal:8080 prathibalanka-web
#
# nginx also forwards /api and /media to the backend, so the browser only ever talks to this origin:
# no CORS, one TLS certificate, and the backend needs no public domain of its own.

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /build

# Copy the lockfile with the manifest so `npm ci` is cached until a dependency actually changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# "/" means "same origin": the bundle calls /api/... and nginx proxies it. Override it with an
# absolute URL only when the API is served from a different domain (then CORS_ALLOWED_ORIGINS on
# the backend must list this site).
ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ---------- serve ----------
FROM nginx:1.27-alpine

# The nginx image substitutes ${PORT} and ${BACKEND_URL} in every file in templates/ at start-up
# (docker-entrypoint.d/20-envsubst-on-templates.sh), so BACKEND_URL is a runtime setting.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.conf /etc/nginx/security-headers.conf

# Guard that runs before the substitution (05 sorts before 20). It is an .envsh, which the image's
# entrypoint *sources* rather than runs, so its normalisation of BACKEND_URL is still in the
# environment when 20-envsubst-on-templates.sh renders the config. The executable bit matters: the
# entrypoint ignores a script that is not executable, silently.
COPY nginx/05-check-backend-url.envsh /docker-entrypoint.d/05-check-backend-url.envsh

COPY --from=build /build/dist /usr/share/nginx/html

RUN chmod 0755 /docker-entrypoint.d/05-check-backend-url.envsh

# The default assumes the backend service is called "backend" in the same Railway project, which is
# where private networking puts it. Railway injects PORT; 80 is the fallback for local runs.
ENV BACKEND_URL=http://backend.railway.internal:8080 \
    PORT=80 \
    TZ=Asia/Colombo

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/healthz" || exit 1
