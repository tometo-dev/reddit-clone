FROM node:12
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
COPY .env.production .env
RUN yarn run build

ENV NODE_ENV production
CMD [ "node", "dist/index.js" ]
USER node