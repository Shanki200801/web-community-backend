FROM node:15
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=3000
ENV DB_URL=mongodb://db:27017/mydb
ENV JWT_SECRET=${JWT_SECRET}
CMD [ "node", "app.js" ]