# 1. 빌드 단계 (Build Stage)
FROM amazoncorretto:21-alpine AS build
WORKDIR /app

# 빌드에 필요한 파일들 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

# gradlew 실행 권한 부여 및 빌드 (테스트 제외)
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2. 실행 단계 (Run Stage)
FROM amazoncorretto:21-alpine
WORKDIR /app

# 빌드 단계에서 생성된 jar 파일만 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 실행
ENTRYPOINT ["java", "-jar", "app.jar"]