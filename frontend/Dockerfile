# 1. 빌드 단계 (Build Stage)
FROM node:20-alpine AS build
WORKDIR /app

# ✅ GitHub Actions에서 넘겨주는 --build-arg 수신
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm install
COPY . .

# React 빌드 실행 (이때 환경 변수가 코드 내부에 박힘)
RUN npm run build

# 2. 실행 단계 (Nginx)
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# ✅ 핵심 수정: 프로젝트에 있는 파일명인 'nginx.conf'를 복사하도록 변경
# 만약 파일명이 nginx.conf라면 아래 줄을 사용하세요.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
