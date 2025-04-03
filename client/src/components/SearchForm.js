import React, { useState } from 'react';
import { getStudentResult } from '../services/api';

function SearchForm({ onResult, onError }) {
    const [studentId, setStudentId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentId) {
            onError('Please enter a Student ID.');
            return;
        }
        try {
            const data = await getStudentResult(studentId);
            onResult(data);
        } catch (err) {
            onError(err.response?.data?.message || 'Error fetching result.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Enter Student ID (e.g., UNI1001)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
            />
            <button type="submit">Get Result</button>
        </form>
    );
}

export default SearchForm;
