import { useCallback, useContext } from "react";
import { UrlContext } from "../context/UrlContext";
import { createShortUrl, getUrls, getStats, deleteUrl } from "../service/api";

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
      setIsLoading(true);
      const data = await createShortUrl(url);
      setShortUrl(data.shortUrl);
      setShortUrls((prevShortUrls) => [data, ...prevShortUrls]);
      setTotalLinks((prevTotalLinks) => prevTotalLinks + 1);
      setIsLoading(false);
    },
    [setIsLoading, setShortUrl, setShortUrls, setTotalLinks],
  );

  const handleGetUrls = useCallback(async () => {
    let urls = await getUrls();
    urls = Array.isArray(urls) ? urls : [];
    setShortUrls(urls);
  }, [setShortUrls]);

  const handleGetStats = useCallback(async () => {
    const stats = await getStats();
    setTotalClicks(stats.totalClicks);
    setTotalLinks(stats.totalLinks);
  }, [setTotalClicks, setTotalLinks]);

  const handleDeleteUrl = useCallback(async (id) => {
    setIsLoading(true);
    await deleteUrl(id);
    setShortUrls((prevShortUrls) =>
      prevShortUrls.filter((shortUrlItem) => shortUrlItem.id !== id),
    );
    setTotalLinks((prevTotalLinks) => prevTotalLinks - 1);
    setIsLoading(false);
  }, [setIsLoading, setShortUrls, setTotalLinks]);

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
    handleGetUrls,
    handleGetStats,
    handleDeleteUrl,
  };
};
