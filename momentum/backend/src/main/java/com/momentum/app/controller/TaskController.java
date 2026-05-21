package com.momentum.app.controller;

import com.momentum.app.dto.task.CreateTaskRequest;
import com.momentum.app.dto.task.TaskResponse;
import com.momentum.app.dto.task.TaskStatisticsResponse;
import com.momentum.app.dto.task.UpdateTaskRequest;
import com.momentum.app.model.TaskStatus;
import com.momentum.app.model.User;
import com.momentum.app.security.CustomUserDetails;
import com.momentum.app.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        User user = userDetails.getUser();

        TaskResponse response = taskService.createTask(user, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String search
    ) {
        User user = userDetails.getUser();

        List<TaskResponse> tasks;

        if (search != null && !search.isBlank()) {
            tasks = taskService.searchTasks(user, search, status);
        } else if (status != null) {
            tasks = taskService.getTasksByStatus(user, status);
        } else {
            tasks = taskService.getAllTasks(user);
        }

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/statistics")
    public ResponseEntity<TaskStatisticsResponse> getTaskStatistics(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();

        return ResponseEntity.ok(taskService.getTaskStatistics(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        User user = userDetails.getUser();

        return ResponseEntity.ok(taskService.getTaskById(user, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        User user = userDetails.getUser();

        return ResponseEntity.ok(taskService.updateTask(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        User user = userDetails.getUser();

        taskService.deleteTask(user, id);

        return ResponseEntity.noContent().build();
    }
}