import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);

    // validate backend response
    if (!response.data?.success) {
      throw new Error(response.data?.error || "Failed to load dashboard");
    }

    return response.data.data; // only dashboard payload

  } catch (error) {
    console.error("Dashboard API Error:", error);

    // handle auth error
    if (error.response?.status === 401) {
      throw { message: "Session expired. Please login again." };
    }

    // handle server error
    if (error.response?.data?.error) {
      throw { message: error.response.data.error };
    }

    // fallback
    throw { message: "Unable to fetch dashboard data. Try again later." };
  }
};

const progressService = { 
    getDashboardData
}

export default progressService