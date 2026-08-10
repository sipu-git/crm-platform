export const handleApiError = (error: any): string => {
    console.log("API Error:", error?.response?.status);
    console.log("API Error Data:", error?.response?.data);
    
    const data = error?.response?.data;

    if (typeof data === "string" && data.trim().startsWith("<")) {
        return "API endpoint not found. Check your request URL.";
    }

    return (
        data?.message ||
        data?.error ||
        error?.message ||
        "Something went wrong"
    );
};