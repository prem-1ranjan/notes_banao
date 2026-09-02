package com.notesbanao.portal.repository;

import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public void saveFromRequest(UserSaveRequest request) {

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw ApiException.badRequest("An account with this email already exist.");
        }

        UserEntity user = new UserEntity();

        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setDateOfBirth(request.dateOfBirth());

        userRepository.save(user);
    }

    public void updatePassword(Long userId, String newPassword) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notLoggedIn());

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }
}
