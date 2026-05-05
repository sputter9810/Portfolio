package com.momentum.app.controller;

import com.momentum.app.dto.task.CreateTaskRequest;
import com.momentum.app.dto.task.TaskResponse;
import com.momentum.app.dto.task.UpdateTaskRequest;
import com.momentum.app.model.TaskStatus;
import com.momentum.app.model.User;
import com.momentum.app.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public TaskResponse createTask(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        return taskService.createTask(user, request);
    }

    @GetMapping
    public List<TaskResponse> getAllTasks(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) TaskStatus status
    ) {
        if (status != null) {
            return taskService.getTasksByStatus(user, status);
        }

        return taskService.getAllTasks(user);
    }

    @GetMapping("/{id}")
    public TaskResponse getTaskById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        return taskService.getTaskById(user, id);
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        return taskService.updateTask(user, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        taskService.deleteTask(user, id);
    }
}