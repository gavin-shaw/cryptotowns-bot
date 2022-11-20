FROM node:16.13.1

WORKDIR /app 

COPY package.json /app 
COPY yarn.lock /app

RUN yarn install

COPY ./src ./src
COPY ./tsconfig.json ./ 

CMD ["yarn","start"]