import exec from 'k6/x/exec';
import { sleep, group, check } from 'k6';
import { describe } from 'https://jslib.k6.io/expect/0.0.5/index.js';
import execution from 'k6/execution';
import { Trend } from 'k6/metrics';

const USERNAME = `${__ENV.CRAAS_USERNAME}`;
const PASSWORD = `${__ENV.CRAAS_PASSWORD}`;
const BASEURL = "cr.selcloud.ru";
const registryName = `${__ENV.CRAAS_REGISTRY}`;
const image = `${__ENV.CRAAS_IMAGE}`;
const tag = `${__ENV.CRAAS_TAG}`;
const IMAGE = `${BASEURL}/${registryName}/${image}:${tag}`;
const d = new Date();
const pullTimeTrendSec = new Trend('pull_time_sec');
const pullTimeTrendMin = new Trend('pull_time_min');
const pullSpeedTrend = new Trend('pull_speed_mbs');


export const options = {
  vus: `${__ENV.CRAAS_VUS}`,
  duration: `${__ENV.CRAAS_DURATION}`,
};

export default function testSuite() {

  let res;
  let date = d.toDateString();
  let time = d.toTimeString();
  let start_pull_time;
  let end_pull_time;
  let pull_time_sec;
  let image_size_string;
  let pull_speed_mbs;

  console.log("START TIME: ", date, time);

  //we have to be sure that the image doesn't exist
  // describe('01. Delete image', (t) => {

  //   res = exec.command("docker", ["system", "prune", "--volumes", "--all", "--force"]);

  //    check(res, {
  //      'Delete image': (r) => r.includes("Total reclaimed space")
  //    });

  //    console.log("\nDELETE IMAGE RESPONSE:\n", JSON.stringify(res))
  //   sleep(1);
  // })

  // &&

  //login to craas to be able to download images
  describe('02. Login', (t) => {

    //let start = new Date() - new Date(execution.scenario.startTime);

    res = exec.command("docker", ["login", `${BASEURL}`, "-u", `${USERNAME}`, "-p", `${PASSWORD}`]);
    console.log("\nLOGIN RESPONSE:\n", JSON.stringify(res));
    
    //let end = new Date() - new Date(execution.scenario.startTime);

    //console.log(`Duration:  ${end - start}ms ${IMAGE} `);
    check(res, {
      'Login': (r) => r.includes(`Login Succeeded`)
    })

    sleep(1);
  })

  &&

  //execution of 'docker pull <image> command'
  describe('03. Pull', (t) => {
    start_pull_time = new Date() - new Date(execution.scenario.startTime);

    res = exec.command("docker",["pull", `${IMAGE}`]);
    check(res, {
       'Pull': (r) => r.includes(`Status: Downloaded newer image`)
     });

    end_pull_time = new Date() - new Date(execution.scenario.startTime);

    sleep(1);
  })

  &&

  //get list of all images, get image size, calculations of pulling time and pulling speed
  describe('04. Images', (t) => {
    let image_size;

    res = exec.command("docker",["image", "ls"]);

    let parseARR = res.split(' ')

    parseARR.forEach(line =>{
      if (line.includes('GB') || line.includes('MB')) {
        image_size_string = line;
        image_size = parseFloat(line);
      }
    })

    pull_time_sec = Math.floor((end_pull_time - start_pull_time)*100)/100/1000; //sec
    let pull_time_min = Math.floor((pull_time_sec/60)*100)/100;

    if (image_size_string.includes('GB')) pull_speed_mbs = (image_size*1024)/pull_time_sec; // convert image size from Gb to Mb (Mb/s)
    else if (image_size_string.includes('MB')) pull_speed_mbs = image_size/pull_time_sec; // Mb/s
    
    console.log(`\nIMAGE:\n${IMAGE}\n\nRESPONSE PULL:\n`, JSON.stringify(res), `\n\nIMAGE SIZE:\n`, image_size_string, `\n\nPULL DURATION:\n${pull_time_sec} sec\n${pull_time_min} min`, `\n\nSPEED:\n${Math.floor(pull_speed_mbs*100)/100} Mb/s`);
    pullTimeTrendSec.add(pull_time_sec);
    pullTimeTrendMin.add(pull_time_min);
    pullSpeedTrend.add(pull_speed_mbs);
    
    sleep(1);
    // date = d.toDateString();
    // time = d.toTimeString();
    // console.log("END TIME: ", date, time);
  });
}