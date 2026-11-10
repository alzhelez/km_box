FROM node:22-alpine
WORKDIR /app
COPY public ./public
COPY server ./server
ENV PORT=3000 DB_PATH=/app/data/kmbox.db NODE_NO_WARNINGS=1
VOLUME /app/data
EXPOSE 3000
CMD ["node", "server/server.js"]
