// Note: Service để xử lý logic liên quan đến User
// Cung cấp các phương thức tìm kiếm và cập nhật thông tin user
package com.gamehub.service;

import com.gamehub.exception.ResourceNotFoundException;
import com.gamehub.model.User;
import com.gamehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User updateUserBalance(Long userId, BigDecimal amount) {
        User user = findById(userId);
        BigDecimal currentBalance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        user.setBalance(currentBalance.add(amount));
        return userRepository.save(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
