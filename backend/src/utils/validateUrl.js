const validateUrl = (url) => {
  if (typeof url != "string" || !url || !url.trim()) {
    return false;
  }
  const trimmedUrl = url.trim();

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return false;
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    return false;
  }

  if (trimmedUrl.length > 2048) {
    return false;
  }

  return true;
};

export { validateUrl };
