# 1. 빌드 단계 (Build Stage)
FROM amazoncorretto:21-alpine AS build
WORKDIR /app

# 빌드 필수 파일 복사 (캐시 활용)
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# 실행 권한 부여 및 의존성 다운로드
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon

# 소스 복사 및 빌드 (테스트 제외)
COPY src src
RUN ./gradlew clean build -x test --no-daemon

# 2. 실행 단계 (Run Stage)
FROM amazoncorretto:21-alpine
WORKDIR /app

# 한국 타임존 설정
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 빌드된 jar 파일 복사 (plain.jar 제외 패턴)
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
