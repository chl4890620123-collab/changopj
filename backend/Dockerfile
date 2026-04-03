FROM amazoncorretto:21-alpine AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon
COPY src src
RUN ./gradlew clean build -x test --no-daemon

FROM amazoncorretto:21-alpine
WORKDIR /app
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone
# 빌드된 jar 파일 복사 (plain 제외)
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
