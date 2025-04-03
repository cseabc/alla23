import axios from 'axios';

const BASE_URL = process.env.REACT_APP_LOAD_BALANCER_URL;

export const getStudentResult = async (studentId) => {
    const upperCaseStudentId = studentId.toUpperCase();
    let attempts = 2; // Retry once if the first request fails

    while (attempts > 0) {
        try {
            const response = await axios.get(`${BASE_URL}/${encodeURIComponent(upperCaseStudentId)}`);
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
