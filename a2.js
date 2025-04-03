// a2.js – Approach 2: 1 Client → Single Server (port 5100)
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Options: 100 virtual users for 30 seconds
export let options = {
    vus: 100,
    duration: '30s',
};

// Custom metrics
export let responseTime = new Trend('response_time', true);
export let errorRate = new Rate('errors');

// Generate a random student ID between 1001 and 7999, prefixed with "UNI"
function randomStudentId() {
    const randomNum = Math.floor(Math.random() * (7999 - 1001 + 1)) + 1001;
    return `UNI${randomNum}`;
}

export default function () {
    const studentId = randomStudentId();
    // Targeting the single server endpoint on port 5100
    const url = `http://localhost:5100/api/results/${studentId}`;
    const res = http.get(url);

    // Record response time
    responseTime.add(res.timings.duration);

    // Check that status is either 200 or 404
    const success = check(res, {
        'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
    errorRate.add(!success);

    sleep(1);
}

// -------------------------------------------------------
// Generate an HTML report after the test finishes

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export function handleSummary(data) {
    return {
        "report_a2.html": htmlReport(data, { title: "K6 Load Test Report - Approach 2" }),
        stdout: textSummary(data, { indent: "  ", enableColors: true }),
    };
}
