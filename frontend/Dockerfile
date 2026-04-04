# 1. 빌드 단계 (Build Stage)
FROM node:20-alpine AS build
WORKDIR /app

# 빌드 시점에 환경변수 주입 (GitHub Actions의 --build-arg를 수신)
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm install
COPY . .

# React 빌드 실행 (위의 ENV 값이 index.html/main.js에 박힘)
RUN npm run build

# 2. 실행 단계 (Nginx)
FROM nginx:stable-alpine
# 빌드 결과물을 Nginx 정적 폴더로 복사
COPY --from=build /app/build /usr/share/nginx/html

# 이전에 만든 default.conf가 있다면 함께 복사 (404 에러 방지용)
# COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
