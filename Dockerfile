FROM node
MAINTAINER oscar-rreyes1@hotmail.com

ONBUILD RUN npm install nodemon -g

WORKDIR /usr/src/app
COPY . .