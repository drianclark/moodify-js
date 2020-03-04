FROM node:12.14.1-stretch

WORKDIR /app

COPY package.json .

RUN npm i --quiet

# copy everything inside /server into /app
COPY . .