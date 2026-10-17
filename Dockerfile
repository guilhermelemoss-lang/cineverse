FROM nginx:alpine

COPY CineVerse/ /usr/share/nginx/html/

EXPOSE 80