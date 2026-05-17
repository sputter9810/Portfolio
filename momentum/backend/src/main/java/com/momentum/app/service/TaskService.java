package com.momentum.app.service;

import com.momentum.app.dto.task.CreateTaskRequest;
import com.momentum.app.dto.task.TaskResponse;
import com.momentum.app.dto.task.TaskStatisticsResponse;
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

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        task.setDueDate(request.getDueDate());

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

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        task.setDueDate(request.getDueDate());

        Task updatedTask = taskRepository.save(task);

        return TaskResponse.from(updatedTask);
    }

    public void deleteTask(User user, Long id) {
        Task task = findTaskOrThrow(user, id);
        taskRepository.delete(task);
    }

    public TaskStatisticsResponse getTaskStatistics(User user) {
        List<Task> tasks = taskRepository.findByUserId(user.getId());

        long totalTasks = tasks.size();

        long todoTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.TODO)
                .count();

        long inProgressTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS)
                .count();

        long completedTasks = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();

        double completionPercentage = totalTasks == 0
                ? 0
                : ((double) completedTasks / totalTasks) * 100;

        TaskStatisticsResponse statistics = new TaskStatisticsResponse();

        statistics.setTotalTasks(totalTasks);
        statistics.setTodoTasks(todoTasks);
        statistics.setInProgressTasks(inProgressTasks);
        statistics.setCompletedTasks(completedTasks);
        statistics.setCompletionPercentage(
                Math.round(completionPercentage * 10.0) / 10.0
        );

        return statistics;
    }

    private Task findTaskOrThrow(User user, Long id) {
        return taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }
}