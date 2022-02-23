FROM node:16-alpine AS builder
WORKDIR /usr/app
COPY ./package.json ./
RUN yarn install --production
COPY . .
RUN yarn build

FROM nginx
EXPOSE 3000

COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/app/build /usr/share/nginx/html
