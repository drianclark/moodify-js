FROM node:12.14.1-stretch

WORKDIR /server

COPY package.json .

RUN npm install

# copy everything inside /server into /server
COPY . .