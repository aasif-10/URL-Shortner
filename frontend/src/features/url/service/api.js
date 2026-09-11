import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/urls`,
  timeout: 5000,
});

const createShortUrl = async (url) => {
  const response = await api.post("/create", {
    url,
  });
  return response.data.createdUrl;
};

const getUrls = async () => {
  const response = await api.get("/");
  return response.data.urls;
};

const getStats = async () => {
  const response = await api.get("/stats");
  return response.data;
};

export { createShortUrl, getUrls, getStats };
