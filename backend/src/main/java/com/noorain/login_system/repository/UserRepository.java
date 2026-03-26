package com.noorain.login_system.repository;

import com.noorain.login_system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    // will find user by email -> custom method
    // Optional to avoid nullPointerException in case of no email available
    Optional<User> findByEmail(String email);
}
