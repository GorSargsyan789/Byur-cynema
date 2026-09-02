FROM nginx:alpine

WORKDIR /us/share/nginx/html
RUN rm -rf ./*
COPY . .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

