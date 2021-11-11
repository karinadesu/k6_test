import { describe } from 'https://jslib.k6.io/expect/0.0.5/index.js';
import { Httpx, Request, Get, Post } from 'https://jslib.k6.io/httpx/0.0.4/index.js';
import { randomIntBetween, randomItem } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { sleep, group, check } from "k6";
import http from "k6/http";

let res;

export let options = {
  stages: [
    { duration: '5m', target: 6 }, // simulate ramp-up of traffic from 1 to 6 users over 5 minutes.
    { duration: '10m', target: 6 }, // stay at 6 users for 10 minutes
    { duration: '5m', target: 8 }, // ramp-up to 8 users over 5 minutes 
    { duration: '10m', target: 8 }, // stay at 8 users for for 10 minutes
    { duration: '5s', target: 0 }, // ramp-down to 0 users
  ],
  //thresholds: {
  //  http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  //},
};

export default function testSuite() {

  describe('08. Open ya.ru', (t) => {

    res = http.get("https://ya.ru");

    check(res, {
      'status is 200': (r) => r.status === 200,
    });

    sleep(1);
  });
}