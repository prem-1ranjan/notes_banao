package com.notesbanao.portal.repository;

import com.notesbanao.portal.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);


    // =========================
    // ADD REFERRAL POINTS
    // =========================

    @Modifying
    @Query(value = """
            UPDATE users
            SET balance_points = balance_points + :points
            WHERE id = :userId
              AND deleted_at IS NULL
            """, nativeQuery = true)
    int addPointsAtomically(
            @Param("userId") Long userId,
            @Param("points") int points
    );


    // =========================
    // SOFT DELETE USER
    // =========================

    @Modifying
    @Query(value = """
            UPDATE users
            SET deleted_at = :deletedAt
            WHERE id = :userId
              AND deleted_at IS NULL
            """, nativeQuery = true)
    int softDelete(
            @Param("userId") Long userId,
             @Param("deletedAt") Instant deletedAt
    );


    // =========================
    // RESTORE USER
    // =========================

    @Modifying
    @Query(value = """
            UPDATE users
            SET deleted_at = NULL
            WHERE id = :userId
            """, nativeQuery = true)
    int restoreUser(
            @Param("userId") Long userId
    );


    // =========================
    // FIND USER INCLUDING DELETED
    // =========================

    @Query(value = """
            SELECT *
            FROM users
            WHERE lower(email) = lower(:email)
            """, nativeQuery = true)
    Optional<UserEntity> findAnyByEmail(
            @Param("email") String email
    );


    // =========================
    // PERMANENT DELETE
    // =========================

    @Modifying
    @Query(value = """
        DELETE FROM users
        WHERE deleted_at IS NOT NULL
          AND CAST(deleted_at AS INTEGER)
              < (CAST(strftime('%s','now') AS INTEGER) * 1000
                 - 7 * 24 * 60 * 60 * 1000)
        """, nativeQuery = true)
    int deleteExpiredUsers();
}