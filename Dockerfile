FROM node:latest

MAINTAINER cote.serveur@esprit.tn

USER root

ENV NODE_ENV=production

COPY . /home/node/app

WORKDIR /home/node/app

RUN npm install

EXPOSE 9090

CMD ["npm", "start"]