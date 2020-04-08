FROM monomial123/vue-cli-4:0.1

WORKDIR /frontend

COPY package*.json ./

RUN npm install

# copy everything inside /frontend into /frontend
COPY . .