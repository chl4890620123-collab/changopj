# 1. 빌드 단계
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# CRA는 변수명이 반드시 REACT_APP_으로 시작해야 인지합니다.
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

# CRA 빌드 명령어 (결과물은 /app/build 폴더에 생김)
RUN npm run build

# 2. 실행 단계 (Nginx)
FROM nginx:stable-alpine
# ★중요: App.js 기반 프로젝트는 dist가 아니라 build입니다!
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
