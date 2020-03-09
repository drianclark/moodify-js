FROM ebiven/vue-cli

WORKDIR /frontend

COPY package*.json ./

RUN npm install

# copy everything inside /frontend into /frontend
COPY . .