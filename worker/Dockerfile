FROM node:16-alpine
WORKDIR /usr/app
COPY ./package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY . .
CMD ["yarn", "start"]