# JPA init checklist — Java

- [ ] `spring-boot-starter-data-jpa` no `apps/backend-java/build.gradle`
- [ ] `flyway-core` + `flyway-database-postgresql`
- [ ] `application.yml`: datasource, jpa, flyway
- [ ] `.env.example`: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- [ ] `docker-compose.yml` Postgres alinhado ao `.env`
- [ ] Migration bootstrap `V1__bootstrap.sql`
- [ ] Por BC: `V{n}__create_<table>.sql` + `*JpaEntity.java` na infra
- [ ] Domínio **sem** anotações JPA (`@Entity`, `@Table`)
- [ ] `./gradlew :apps:backend-java:test` passa
