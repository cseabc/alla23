import axios from 'axios';

const BASE_URL = process.env.REACT_APP_LOAD_BALANCER_URL; // This should point to your LB, e.g., "https://loadbalancer-uzlh.onrender.com"

// Function to retrieve student results; retries once on failure
export const getStudentResult = async (studentId) => {
  const upperCaseStudentId = studentId.toUpperCase();
  let attempts = 2; // Allow one retry
  
  while (attempts > 0) {
    try {
      const response = await axios.get(`${BASE_URL}/api/results/${encodeURIComponent(upperCaseStudentId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result:', error.message);
      if (attempts === 1) {
        throw new Error(error.response?.data?.message || 'Error fetching result.');
      }
    }
    attempts--;
  }
};
