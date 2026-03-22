FROM node:24-alpine

WORKDIR /app

COPY package*.json lerna.json ./
COPY packages ./packages
COPY dashboard ./dashboard
COPY docs ./docs
COPY styles.css ./styles.css
COPY AGENTS.md ./AGENTS.md

RUN npm ci

ENV NODE_ENV=production
ENV PORT=4173

EXPOSE 4173

CMD ["npm", "run", "home"]
