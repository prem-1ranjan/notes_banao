package com.notesbanao.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.notesbanao.portal.config.PortalProperties;

/**
 * A Java implementation of the NotesBanao portal API.
 *
 * The Next.js front end in the parent folder can talk to either this service or
 * the small Node demo backend bundled with it — they implement the same
 * contract, written down in ../API-CONTRACT.md. Point the front end here with:
 *
 *     NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
 *
 * Data lives in a SQLite file (data/notesbanao.db by default), created and
 * seeded on first start from the JSON in src/main/resources/seed.
 */
@SpringBootApplication
@EnableConfigurationProperties(PortalProperties.class)
public class PortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortalApplication.class, args);
    }
}
