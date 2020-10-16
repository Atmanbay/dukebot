FROM node:14.5.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "dist/" ]