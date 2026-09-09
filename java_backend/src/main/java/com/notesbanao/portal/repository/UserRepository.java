package com.notesbanao.portal.repository;

import com.notesbanao.portal.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    @Modifying
    @Query("""
            UPDATE UserEntity u
            SET u.balancePoints = u.balancePoints + :points
            WHERE u.id = :userId
            """)
    int addPointsAtomically(
            @Param("userId") Long userId,
            @Param("points") int points
    );
}
