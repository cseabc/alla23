import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export let options = {
    vus: 1,       // Using a single VU for logging
    duration: '10s',
};

// Global array to store request logs (shared by the single VU)
let requestLogs = [];

// Generate a random student ID between 1001 and 7999, prefixed with "UNI"
function randomStudentId() {
    const randomNum = Math.floor(Math.random() * (7999 - 1001 + 1)) + 1001;
    return `UNI${randomNum}`;
}

export default function () {
    const studentId = randomStudentId();
    const url = `http://localhost:3000/api/results/${studentId}`;
    const res = http.get(url);

    // Try to extract server port from the JSON response (if provided)
    let serverPort = 'unknown';
    try {
        const jsonBody = JSON.parse(res.body);
        if (jsonBody.serverInfo) {
            serverPort = jsonBody.serverInfo;
        }
    } catch (e) {
        // If parsing fails, serverPort remains 'unknown'
        console.log(`JSON parse error for ${studentId}: ${e}`);
    }

    // Check that the response status is either 200 or 404
    check(res, {
        'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });

    // Log the request details (studentId, status, serverPort) to the array
    console.log(`Logging: ${studentId}, ${res.status}, ${serverPort}`);
    requestLogs.push(`${studentId},${res.status},${serverPort}`);

    sleep(1);
}

// handleSummary aggregates data and writes a CSV file
export function handleSummary(data) {
    // Build CSV content with header
    let csvContent = 'studentId,status,serverPort\n';
    for (let entry of requestLogs) {
        csvContent += entry + '\n';
    }

    return {
        // This will create a file named "summary.csv" containing the CSV data
        'summary.csv': csvContent,
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}
