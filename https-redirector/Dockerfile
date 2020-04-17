FROM node:12.14.1-alpine3.11

WORKDIR /https-redirector

COPY package.json .

RUN npm install

# copy everything inside /https-redirector into /https-redirector
COPY . .