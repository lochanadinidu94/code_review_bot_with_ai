import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const api = axios.create({
  baseURL: `${process.env.GITLAB_URL}/api/v4`,
  headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN }
});

export async function getMergeRequestDetails(projectPath, mrIid) {
  const projectEncoded = encodeURIComponent(projectPath);
  const response = await api.get(`/projects/${projectEncoded}/merge_requests/${mrIid}`);
  return response.data;
}

export async function getMergeRequestChanges(projectPath, mrIid) {
  const projectEncoded = encodeURIComponent(projectPath);
  const response = await api.get(`/projects/${projectEncoded}/merge_requests/${mrIid}/changes`);
  return response.data.changes;
}

export async function postMergeRequestComment(projectPath, mrIid, comment) {
  const projectEncoded = encodeURIComponent(projectPath);
  const response = await api.post(`/projects/${projectEncoded}/merge_requests/${mrIid}/notes`, {
    body: comment,
  });

  return response.data;
}
