package com.notesbanao.portal.repository;

import com.notesbanao.portal.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void save(UserEntity userEntity){

        userRepository.save(userEntity);

    }
    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    public void saveFromRequest(UserSaveRequest request) {
        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setDateOfBirth(request.dateOfBirth());



        userRepository.save(user);
    }
}
