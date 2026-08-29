package com.notesbanao.portal.repository;

import com.notesbanao.portal.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public void save(UserEntity userEntity){

        userRepository.save(userEntity);
    }
    public void saveFromRequest(UserSaveRequest request) {
        UserEntity user = new UserEntity();
        user.setId(java.util.UUID.randomUUID().toString());
        user.setEmail(request.email());
        user.setPassword(request.password());
        userRepository.save(user);
    }
}
