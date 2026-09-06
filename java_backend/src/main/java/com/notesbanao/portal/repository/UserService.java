package com.notesbanao.portal.repository;

import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.entity.UserEntity;
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

    public UserEntity saveFromRequest(UserSaveRequest request) {

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
        user.setPhone(request.phone());


       return userRepository.save(user);
    }

    public void updatePassword(Long userId, String newPassword) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notLoggedIn());

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }

    public void addPoints(Long userId, int points) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.badRequest("User not found."));

        user.setBalancePoints(user.getBalancePoints() + points);
        userRepository.save(user);
    }

    public void updatePhone(String email, String phone) {

        UserEntity user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        user.setPhone(phone);
        user.setPhoneVerified(true);

        userRepository.save(user);
    }
}
