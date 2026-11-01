FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY styles/ /usr/share/nginx/html/styles/
COPY src/ /usr/share/nginx/html/src/

EXPOSE 80