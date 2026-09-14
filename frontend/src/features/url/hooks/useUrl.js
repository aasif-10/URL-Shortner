import { useCallback, useContext } from "react";
import { UrlContext } from "../context/UrlContext";
import {
  createShortUrl,
  createShortUrlWithSlug,
  getUrls,
  getStats,
  deleteUrl,
} from "../service/api";

export const useUrl = () => {
  const context = useContext(UrlContext);
  const {
    shortUrl,
    setShortUrl,
    isLoading,
    setIsLoading,
    shortUrls,
    setShortUrls,
    totalClicks,
    setTotalClicks,
    totalLinks,
    setTotalLinks,
  } = context;

  const handleCreateShortUrl = useCallback(
    async (url) => {
      try {
        setIsLoading(true);
        const data = await createShortUrl(url);
        setShortUrl(data.shortUrl);
        setShortUrls((prevShortUrls) => [data, ...prevShortUrls]);
        setTotalLinks((prevTotalLinks) => prevTotalLinks + 1);
        setIsLoading(false);
      } catch (error) {
        console.error("Create short URL failed: ", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setShortUrl, setShortUrls, setTotalLinks],
  );

  const handleCreateShortUrlWithSlug = useCallback(
    async (url, slug) => {
      try {
        setIsLoading(true);
        const data = await createShortUrlWithSlug(url, slug);
        setShortUrl(data.shortUrl);
        setShortUrls((prevShortUrls) => [data, ...prevShortUrls]);
        setTotalLinks((prevTotalLinks) => prevTotalLinks + 1);
        setIsLoading(false);
      } catch (error) {
        console.error("Create short URL with slug failed: ", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setShortUrl, setShortUrls, setTotalLinks],
  );

  const handleGetUrls = useCallback(async () => {
    try {
      let urls = await getUrls();
      urls = Array.isArray(urls) ? urls : [];
      setShortUrls(urls);
    } catch (error) {
      console.error("Get URLs failed: ", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setShortUrls, setIsLoading]);

  const handleGetStats = useCallback(async () => {
    try {
      const stats = await getStats();
      setTotalClicks(stats.totalClicks);
      setTotalLinks(stats.totalLinks);
    } catch (error) {
      console.error("Get stats failed: ", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setTotalClicks, setTotalLinks, setIsLoading]);

  const handleDeleteUrl = useCallback(
    async (id) => {
      try {
        setIsLoading(true);
        await deleteUrl(id);
        setShortUrls((prevShortUrls) =>
          prevShortUrls.filter((shortUrlItem) => shortUrlItem.id !== id),
        );
        setTotalLinks((prevTotalLinks) => prevTotalLinks - 1);
      } catch (error) {
        console.error("Delete URL failed: ", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setShortUrls, setTotalLinks],
  );

  return {
    shortUrl,
    setShortUrl,
    isLoading,
    setIsLoading,
    shortUrls,
    setShortUrls,
    totalClicks,
    setTotalClicks,
    totalLinks,
    setTotalLinks,
    handleCreateShortUrl,
    handleCreateShortUrlWithSlug,
    handleGetUrls,
    handleGetStats,
    handleDeleteUrl,
  };
};
