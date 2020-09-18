FROM node:12.2.0
WORKDIR /app
COPY . .
RUN npm install -g -s yarn@1.x && \
  yarn && \
  yarn run build && \
  yarn cache clean

CMD [ "yarn", "start" ]