FROM node:12.7.0-stretch-slim

MAINTAINER oscar-rreyes1@hotmail.com

RUN npm install pm2 yarn -g

WORKDIR /usr/src/app

COPY . .
