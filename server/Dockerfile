FROM node:12
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn run build

ENV NODE_ENV production
CMD [ "node", "dist/index.js" ]