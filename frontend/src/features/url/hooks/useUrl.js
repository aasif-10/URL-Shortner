import { useCallback, useContext } from "react";
import { UrlContext } from "../context/UrlContext";
import { createShortUrl, getUrls, getStats } from "../service/api";

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
      setIsLoading(false);
    },
    [setIsLoading, setShortUrl],
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
  };
};
