FROM --platform=linux/amd64 nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY /dist /usr/share/nginx/html

WORKDIR /usr/share/nginx/html