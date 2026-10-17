FROM nginx:alpine

ARG APP_DIR=.
COPY ${APP_DIR}/ /usr/share/nginx/html/

EXPOSE 80