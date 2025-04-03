import http from 'k6/http';
import { check, sleep } from 'k6';

// Options: 100 virtual users for 30 seconds
export let options = {
    vus: 100,
    duration: '30s',
};

// Generate a random student ID between 1001 and 7999, prefixed with "UNI"
function randomStudentId() {
    const randomNum = Math.floor(Math.random() * (7999 - 1001 + 1)) + 1001;
    return `UNI${randomNum}`;
}

export default function () {
    const studentId = randomStudentId();
    const url = `http://localhost:3000/api/results/${studentId}`;
    const res = http.get(url);

    // Accept both 200 (record found) and 404 (record not found) statuses
    check(res, {
        'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });

    sleep(1);
}
