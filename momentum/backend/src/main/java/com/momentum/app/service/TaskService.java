package com.momentum.app.service;

import com.momentum.app.dto.task.CreateTaskRequest;
import com.momentum.app.dto.task.TaskResponse;
import com.momentum.app.dto.task.UpdateTaskRequest;
import com.momentum.app.exception.TaskNotFoundException;
import com.momentum.app.exception.UserNotFoundException;
import com.momentum.app.model.Task;
import com.momentum.app.model.TaskStatus;
import com.momentum.app.model.User;
import com.momentum.app.repository.TaskRepository;
import com.momentum.app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public TaskResponse createTask(CreateTaskRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + request.getUserId()));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(TaskStatus.TODO);
        task.setUser(user);

        Task savedTask = taskRepository.save(task);

        return TaskResponse.from(savedTask);
    }

    public List<TaskResponse> getAllTasks(Long userId) {
        return taskRepository.findByUserId(userId)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public List<TaskResponse> getTasksByStatus(Long userId, TaskStatus status) {
        return taskRepository.findByUserIdAndStatus(userId, status)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse getTaskById(Long id, Long userId) {
        Task task = findTaskOrThrow(id, userId);
        return TaskResponse.from(task);
    }

    public TaskResponse updateTask(Long id, Long userId, UpdateTaskRequest request) {
        Task task = findTaskOrThrow(id, userId);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task updatedTask = taskRepository.save(task);

        return TaskResponse.from(updatedTask);
    }

    public void deleteTask(Long id, Long userId) {
        Task task = findTaskOrThrow(id, userId);
        taskRepository.delete(task);
    }

    private Task findTaskOrThrow(Long id, Long userId) {
        return taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }
}