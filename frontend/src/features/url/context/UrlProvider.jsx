import { useState } from "react";
import { UrlContext } from "./UrlContext";

export const UrlProvider = ({ children }) => {
  const [shortUrl, setShortUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrls, setShortUrls] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);

  return (
    <UrlContext.Provider
      value={{
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
      }}
    >
      {children}
    </UrlContext.Provider>
  );
};
