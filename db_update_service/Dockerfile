FROM node:12.14.1-alpine3.11

WORKDIR /db_update_service

COPY package.json .

RUN npm install

COPY . .