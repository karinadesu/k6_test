import { describe } from 'https://jslib.k6.io/expect/0.0.5/index.js';
import { Httpx, Request, Get, Post } from 'https://jslib.k6.io/httpx/0.0.4/index.js';
import { randomIntBetween, randomItem } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { SharedArray } from "k6/data";
import { sleep, group, check } from "k6";
import http from "k6/http";
import https from "k6/http";

let userSession;
let res;
let MSOtoken;
let payload;
let flightNum;

const city = ['Denver','Frankfurt','London','Los Angeles','Paris','Portland','San Francisco','Seattle','Sydney','Zurich'];
const USERNAME = "gatling"; 
const PASSWORD = '1';
const baseURL = 'http://www.load-test.ru:1080';

function getRandomFromArr(arr) {
  let i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

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
/*
  describe('01. Open Welcome Page', (t) => {

      http.get('http://www.load-test.ru:1080/webtours/');

      res = http.get(`${baseURL}/cgi-bin/welcome.pl?signOff=true`);

      let headers = res.headers;
      headers = JSON.stringify(headers["Set-Cookie"], null, 4);

      MSOtoken  = headers.split(';',[1])[0].replace('"MSO=','');
      const jar = http.cookieJar();
      jar.set(`${baseURL}`, 'MSO', MSOtoken);
      

      res = http.get(`${baseURL}/cgi-bin/nav.pl?in=home`);
      userSession = res.html().find("input[name='userSession']").val();
      check(res, {
        'status is 200': (r) => r.status === 200,
        'caption is correct': (r) => r.html('title').text() == 'Web Tours Navigation Bar'
      });
  })

  &&

  describe(`02. Login as ${USERNAME}`, (t) => {

    let res = http.post(`${baseURL}/cgi-bin/login.pl`, {
      userSession: `${userSession}`,
      username:  `${USERNAME}`,
      password:  `${PASSWORD}`,
    });

    sleep(3);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'caption is correct': (r) => r.html("title").text() == 'Web Tours',
      'Valid text': (r) => r.body.includes('password was correct') === true,
    });

    sleep(1);
  })

  &&

  describe(`03. Open Page the Flights`, (t) => {

    res = http.get(`${baseURL}/cgi-bin/nav.pl?page=menu&in=flights`);

    sleep(3);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'caption is correct': (r) => r.html("title").text() == 'Web Tours Navigation Bar',
    });

    sleep(1);
  })

  &&

  describe('04. Choose city', (t) => {

    let payload = {
      "advanceDiscount": "0", 
      "depart": getRandomFromArr(city),
      "departDate": "11/10/2021",
      "arrive": getRandomFromArr(city),
      "returnDate": "11/11/2021",
      "numPassengers": "1",
      "seatPref": "None",
      "seatType": "Coach",
      "findFlights.x": "47",
      "findFlights.y": "5",
      ".cgifields": "roundtrip",
      ".cgifields": "seatType",
      ".cgifields": "seatPref"
    };
    
    let res = http.post(`${baseURL}/cgi-bin/reservations.pl`, payload);
    
    sleep(3);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'caption is correct': (r) => r.html("title").text() == 'Flight Selections',
    });

    flightNum = res.html().find("table tr input[type='radio']").toArray();
    //flightNum.forEach(function (el) {
    //  console.log(" EL2: ", el.val());
    //})
    flightNum = getRandomFromArr(flightNum).val();
    
    sleep(1);
  })

  &&

  describe('05. Choose flight', (t) => {

    payload  = {
      outboundFlight: flightNum,
      numPassengers: "1",
      advanceDiscount: "0",
      seatType: "Coach",
      seatPref: "None",
      "reserveFlights.x": "83",
      "reserveFlights.y": "4"
    };

    res = http.post(`${baseURL}/cgi-bin/reservations.pl`, payload);

    sleep(3);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'Valid text': (r) => r.body.includes('outboundFlight') === true
    });
  
    sleep(1);
  })

  &&

  describe('06. Payment', (t) => {

    payload = {
      firstName: "Gatling",
      lastName: "Krueger",
      address1: "",
      address2: "",
      pass1: "Gatling Krueger",
      creditCard: "",
      expDate: "",
      oldCCOption: "",
      numPassengers: "1",
      seatType: "Coach",
      seatPref: "None",
      outboundFlight: flightNum,
      advanceDiscount: "0",
      returnFlight: "",
      JSFormSubmit: "off",
      "buyFlights.x": "76",
      "buyFlights.y": "5",
      ".cgifields": "saveCC",
    };

    res = http.post(`${baseURL}/cgi-bin/reservations.pl`, payload);

    sleep(3);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'caption is correct': (r) => r.html("title").text() == 'Reservation Made!',
    });
  
    sleep(1);
  })

  &&

  describe('07. Open Home Page', (t) => {

    res = http.get(`${baseURL}/cgi-bin/welcome.pl?page=menus`);
    
    sleep(1);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'caption is correct': (r) => r.body.includes('User has returned to the home page.') === true
    });

    sleep(1);
  })

  &&*/

  describe('08. Open ya.ru', (t) => {

    res = http.get("https://ya.ru");
    
    sleep(1);
/*
    check(res, {
      'status is 200': (r) => r.status === 200,
    });*/

    sleep(1);
  });
  /*
  &&
  
  describe('08. Open www.ru', (t) => {

    res = http.get("http://www.ru");
    
    sleep(1);

    check(res, {
      'status is 200': (r) => r.status === 200,
    });

    sleep(1);
  });*/
}