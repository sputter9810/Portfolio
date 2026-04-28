package com.momentum.app.controller;

import com.momentum.app.dto.task.CreateTaskRequest;
import com.momentum.app.dto.task.TaskResponse;
import com.momentum.app.dto.task.UpdateTaskRequest;
import com.momentum.app.model.TaskStatus;
import com.momentum.app.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskResponse createTask(@Valid @RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @GetMapping
    public List<TaskResponse> getAllTasks(
            @RequestParam Long userId,
            @RequestParam(required = false) TaskStatus status
    ) {
        if (status != null) {
            return taskService.getTasksByStatus(userId, status);
        }

        return taskService.getAllTasks(userId);
    }

    @GetMapping("/{id}")
    public TaskResponse getTaskById(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        return taskService.getTaskById(id, userId);
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(
            @PathVariable Long id,
            @RequestParam Long userId,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        return taskService.updateTask(id, userId, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        taskService.deleteTask(id, userId);
    }
}