# 1. 빌드 단계 (Build Stage)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 빌드 시점에 환경변수 주입 (CRA 필수 접두사 REACT_APP_)
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

# React 빌드 실행 (CRA 기준 결과물은 build 폴더)
RUN npm run build

# 2. 실행 단계 (Nginx)
FROM nginx:stable-alpine
# ★중요: CRA 프로젝트는 경로가 /app/build 입니다.
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
