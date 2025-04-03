import axios from 'axios';
const BASE_URL = process.env.REACT_APP_SERVER_URL;
console.log("BASE_URL:", BASE_URL);

export const getStudentResult = async (studentId) => {
    // Convert studentId to uppercase
    const upperCaseStudentId = studentId.toUpperCase();
    const response = await axios.get(`${BASE_URL}/${encodeURIComponent(upperCaseStudentId)}`);
    return response.data;
};
