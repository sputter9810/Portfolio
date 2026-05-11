import apiClient from "./apiClient";

export async function getTasks(status) {
  const params = status ? { status } : {};
  const response = await apiClient.get("/tasks", { params });
  return response.data;
}