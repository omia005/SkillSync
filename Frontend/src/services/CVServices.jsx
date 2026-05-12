import api from "../api";

export const createCV = async () => {
  const res = await api.post("/cv/");
  return res.data;
};

export const fetchCV = async (id) => {
  const res = await api.get(`/cv/${id}/`);
  return res.data;
};

export const updateCV = async (id, data) => {
  const res = await api.put(`/cv/${id}/`, data);
  return res.data;
};

export const deleteCV = async (id) => {
  const res = await api.delete(`/cv/${id}/`);
  return res.data;
};