###########
#  DEV    #
###########

FROM node:16.14-alpine3.15 as base

WORKDIR /home/app

COPY package*.json ./
COPY tsconfig.json ./
COPY yarn.lock ./

RUN yarn install

RUN yarn global add typescript --save-dev

COPY src/ src/
COPY ./public/ ./public/
COPY ./.env ./

EXPOSE 3000

CMD ["yarn",  "start"]