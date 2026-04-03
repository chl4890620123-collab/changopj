FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 빌드 인자 (GitHub Actions에서 넘겨줌)
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
# Vite 사용 시 dist, CRA 사용 시 build (프로젝트에 맞게 수정)
RUN npm run build

FROM nginx:stable-alpine
# 빌드 결과물 경로 확인 필수 (dist 또는 build)
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
