# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -DskipTests clean package

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
ENV SERVER_PORT=8082
EXPOSE 8082
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app/app.jar"]


