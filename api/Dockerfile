FROM node:12.14.1-alpine3.11

WORKDIR /api

COPY package.json .

RUN npm install

# copy everything inside /api into /api
COPY . .
