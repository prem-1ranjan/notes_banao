package com.notesbanao.portal.repository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
public class UserCleanupScheduler {

    private final UserRepository userRepository;

    public UserCleanupScheduler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

   @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void permanentlyDeleteExpiredUsers() {



        int deleted = userRepository.deleteExpiredUsers();

        if (deleted > 0) {
            System.out.println(
                    "Permanently deleted expired users: " + deleted
            );
        }
    }
}