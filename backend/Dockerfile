# Stage 1: Build the JAR
FROM maven:3.9-amazoncorretto-21 AS build
WORKDIR /app

# Copy pom.xml first to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the JAR
FROM amazoncorretto:21-alpine
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/target/devinevibes-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Environment variable for Spring Boot port (Cloud Run sets this automatically)
ENV PORT 8080

ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
