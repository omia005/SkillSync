import api from "../api";

export const createCV = async () => {
  const res = await api.post("/cv/");
  return res.data;
};

export const fetchCV = async (id) => {
  const res = await api.get(`/cv/${id}/`);
  return res.data;
};

// Use the custom PATCH endpoint that handles all nested fields
export const updateCVFields = async (id, data) => {
  const res = await api.patch(`/cv/${id}/update-fields/`, data);
  return res.data;
};