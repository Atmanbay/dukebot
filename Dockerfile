FROM node:20.11.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "dist/" ]