FROM node

MAINTAINER oscar-rreyes1@hotmail.com

RUN npm install pm2 -g

WORKDIR /var/tmp

COPY package.json backend/
RUN cd backend && npm i

COPY ./frontend/package.json frontend/ 
RUN cd frontend && npm i

WORKDIR /usr/src/app

CMD npm start
