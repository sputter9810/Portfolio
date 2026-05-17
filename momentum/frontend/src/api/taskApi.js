import apiClient from "./apiClient";

export async function getTasks(status) {
  const params = status ? { status } : {};

  const response = await apiClient.get("/tasks", { params });

  return response.data;
}

export async function getTaskStatistics() {
  const response = await apiClient.get("/tasks/statistics");

  return response.data;
}

export async function createTask(payload) {
  const response = await apiClient.post("/tasks", payload);

  return response.data;
}

export async function updateTask(id, payload) {
  const response = await apiClient.put(`/tasks/${id}`, payload);

  return response.data;
}

export async function deleteTask(id) {
  await apiClient.delete(`/tasks/${id}`);
}