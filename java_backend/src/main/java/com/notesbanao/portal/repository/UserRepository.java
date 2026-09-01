package com.notesbanao.portal.repository;

import com.notesbanao.portal.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

}
