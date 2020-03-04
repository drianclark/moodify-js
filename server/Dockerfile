FROM node:12.14.1-stretch

WORKDIR /app

COPY package.json .

RUN npm install

# copy everything inside /server into /app
COPY . .