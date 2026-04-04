# 1. 빌드 단계 (Build Stage)
FROM node:20-alpine AS build
WORKDIR /app

# 빌드 시점에 환경변수 주입 (GitHub Actions에서 전달받음)
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm install
COPY . .

# 빌드 실행: 이때 ENV 값이 static 파일들에 박힙니다.
RUN npm run build

# 2. 실행 단계 (Nginx)
FROM nginx:stable-alpine
# 빌드 결과물을 Nginx 정적 폴더로 복사
COPY --from=build /app/build /usr/share/nginx/html

# ✅ 주석 해제: 빌드 시 설정파일을 이미지에 포함시킵니다.
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
