FROM node

MAINTAINER oscar-rreyes1@hotmail.com

RUN npm install pm2 -g

WORKDIR /var/tmp

COPY package.json backend/
RUN cd backend && npm install

COPY ./frontend/package.json frontend/
RUN cd frontend && npm install

RUN mv backend/ /usr/src/app && mv frontend/ /usr/src/app/frontend

WORKDIR /usr/src/app

CMD npm start
