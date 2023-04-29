FROM node:18-alpine
WORKDIR /app

COPY ./index.js .
COPY ./package.json .
COPY ./yarn.lock .
COPY ./routers/* ./routers/
COPY ./utils/* ./utils/
RUN yarn

ENTRYPOINT yarn start
