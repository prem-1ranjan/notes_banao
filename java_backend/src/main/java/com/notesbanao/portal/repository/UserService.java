package com.notesbanao.portal.repository;

import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.entity.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

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
        if(email == null || email.isBlank()){
            return null;
        }
        return userRepository.findByEmailIgnoreCase(email.trim()).orElse(null);
    }

    public UserEntity findById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.badRequest("Referrer account not found."));
    }
    public boolean existsByEmail(String email){
        if(email == null || email.isBlank()){
            return false;
        }
        return userRepository.existsByEmailIgnoreCase(email.trim());
    }

    @Transactional
    public UserEntity saveFromRequest(UserSaveRequest request) {

        String email = request.email().trim().toLowerCase();

//        Existing User Cannot create Another account
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.badRequest("An account with this email already exist.");
        }

        UserEntity user = new UserEntity();
//        Store the normalized email

        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setDateOfBirth(request.dateOfBirth());
        user.setPhone(request.phone());


       return userRepository.save(user);
    }

    @Transactional
    public void updatePassword(Long userId, String newPassword) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notLoggedIn());

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }

    @Transactional
    public void addPoints(Long userId, int points) {
        int updated = userRepository.addPointsAtomically(userId, points);
        if(updated != 1){
            throw ApiException.badRequest("User not found.");
        }
    }

    @Transactional
    public void updatePhone(String email, String phone) {

        UserEntity user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        user.setPhone(phone);
        user.setPhoneVerified(true);

        userRepository.save(user);
    }
    @Transactional
    public void softDeleteUser(String email){
        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(()->ApiException.notLoggedIn());
        user.setDeletedAt(LocalDateTime.now());
    }
}
