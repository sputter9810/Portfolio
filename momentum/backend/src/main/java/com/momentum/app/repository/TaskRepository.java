package com.momentum.app.repository;

import com.momentum.app.model.Task;
import com.momentum.app.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserId(Long userId);

    List<Task> findByUserIdAndStatus(Long userId, TaskStatus status);

    Optional<Task> findByIdAndUserId(Long id, Long userId);
}