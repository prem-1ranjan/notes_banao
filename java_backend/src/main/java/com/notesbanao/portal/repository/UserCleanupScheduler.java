package com.notesbanao.portal.repository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class UserCleanupScheduler {

    private final UserRepository userRepository;

    public UserCleanupScheduler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void permanentlyDeleteExpiredUsers() {

        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);

        int deleted = userRepository.deleteExpiredUsers(cutoff);

        if (deleted > 0) {
            System.out.println(
                    "Permanently deleted expired users: " + deleted
            );
        }
    }
}