export const handleApiError = (error: any): string => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim().startsWith("<")) {
    return "API endpoint not found. Check your request URL.";
  }
  return data?.message || data?.error || error?.message || "Something went wrong";
};