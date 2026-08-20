package com.notesbanao.portal.store;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;

import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Reads the seed files in src/main/resources/seed.
 *
 * Those files are a copy of the Node demo backend's demo-backend/data, so both
 * backends start from the same fixtures. Keep them in sync if you edit either.
 */
final class SampleData {

    private final ObjectMapper mapper = new ObjectMapper();

    JsonNode read(String name) {
        try (InputStream stream = new ClassPathResource("seed/" + name).getInputStream()) {
            return mapper.readTree(stream);
        } catch (IOException error) {
            throw new IllegalStateException("Could not read seed/" + name, error);
        }
    }

    <T> T convert(JsonNode node, Class<T> type) {
        try {
            return mapper.treeToValue(node, type);
        } catch (IOException error) {
            throw new IllegalStateException("Could not read " + type.getSimpleName() + " from the seed data", error);
        }
    }

    /**
     * Seed timestamps are fixed in the JSON, so every one is shifted by the same
     * amount at load time: the newest seeded event lands a couple of minutes
     * ago, and the sample data never looks like it was abandoned last year.
     */
    static long shiftFrom(long newestSeededMillis) {
        return System.currentTimeMillis() - newestSeededMillis - 2 * 60 * 1000L;
    }

    static long millis(String iso) {
        try {
            return Instant.parse(iso).toEpochMilli();
        } catch (RuntimeException error) {
            return Long.MIN_VALUE;
        }
    }

    static String shift(String iso, long shiftMillis) {
        long parsed = millis(iso);
        return parsed == Long.MIN_VALUE ? iso : Instant.ofEpochMilli(parsed + shiftMillis).toString();
    }
}
