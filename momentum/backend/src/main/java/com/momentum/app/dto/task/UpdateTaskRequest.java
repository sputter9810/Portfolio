package com.momentum.app.dto.task;

import com.momentum.app.model.TaskPriority;
import com.momentum.app.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UpdateTaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must be 150 characters or less")
    private String title;

    @Size(max = 1000, message = "Description must be 1000 characters or less")
    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private LocalDate dueDate;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}