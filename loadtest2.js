import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Example options: 5 VUs for 10 seconds
export let options = {
    vus: 5,
    duration: '10s',
};

// Local array to store request details
// (Note: This won't aggregate across multiple VUs in large tests)
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

    // Attempt to parse "server port" (or other info) from the JSON body
    let serverPort = 'unknown';
    try {
        const jsonBody = JSON.parse(res.body);
        if (jsonBody.serverInfo) {
            serverPort = jsonBody.serverInfo;
        }
    } catch (e) {
        // Possibly a 404 or an unparseable body
    }

    // Accept both 200 (found) and 404 (not found)
    check(res, {
        'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });

    // Log this request in our local array
    requestLogs.push(`${studentId},${res.status},${serverPort}`);

    // Sleep 1 second between iterations
    sleep(1);
}

// HandleSummary lets us generate custom output files at the end of the test
export function handleSummary(data) {
    // Build a CSV string with headers + each line from requestLogs
    let csvContent = 'studentId,status,serverPort\n';
    for (let line of requestLogs) {
        csvContent += line + '\n';
    }

    return {
        // This key/value pair creates a file named "summary.csv" containing csvContent
        'summary.csv': csvContent,

        // Also print a text summary to stdout
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}
