import React from 'react';

function ResultsDisplay({ result }) {
    return (
        <div className="results-display">
            <h2>Student Result</h2>
            <p><strong>Student ID:</strong> {result.studentId}</p>
            <p><strong>Name:</strong> {result.name}</p>
            <p><strong>Course:</strong> {result.course}</p>
            <p><strong>Semester:</strong> {result.semester}</p>

            <h3>Grades:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Credits</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(result.grades).map(([subject, grade], index) => (
                        <tr key={index}>
                            <td>{subject}</td>
                            <td>{grade}</td>
                            <td>N/A</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p><strong>CGPA:</strong> {result.cgpa}</p>
        </div>
    );
}

export default ResultsDisplay;
