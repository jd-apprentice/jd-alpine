FROM nginx:alpine3.18
COPY ./index.html /usr/share/nginx/html
EXPOSE 80