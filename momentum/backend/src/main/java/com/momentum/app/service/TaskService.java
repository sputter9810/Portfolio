package com.momentum.app.service;

import com.momentum.app.dto.task.CreateTaskRequest;
import com.momentum.app.dto.task.TaskResponse;
import com.momentum.app.dto.task.UpdateTaskRequest;
import com.momentum.app.exception.TaskNotFoundException;
import com.momentum.app.model.Task;
import com.momentum.app.model.TaskStatus;
import com.momentum.app.model.User;
import com.momentum.app.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskResponse createTask(User user, CreateTaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(TaskStatus.TODO);
        task.setUser(user);

        Task savedTask = taskRepository.save(task);

        return TaskResponse.from(savedTask);
    }

    public List<TaskResponse> getAllTasks(User user) {
        return taskRepository.findByUserId(user.getId())
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public List<TaskResponse> getTasksByStatus(User user, TaskStatus status) {
        return taskRepository.findByUserIdAndStatus(user.getId(), status)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse getTaskById(User user, Long id) {
        Task task = findTaskOrThrow(user, id);
        return TaskResponse.from(task);
    }

    public TaskResponse updateTask(User user, Long id, UpdateTaskRequest request) {
        Task task = findTaskOrThrow(user, id);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task updatedTask = taskRepository.save(task);

        return TaskResponse.from(updatedTask);
    }

    public void deleteTask(User user, Long id) {
        Task task = findTaskOrThrow(user, id);
        taskRepository.delete(task);
    }

    private Task findTaskOrThrow(User user, Long id) {
        return taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }
}