import exec from 'k6/x/exec';
import { sleep, group, check } from 'k6';
import { describe } from 'https://jslib.k6.io/expect/0.0.5/index.js';

import execution from 'k6/execution';

const USERNAME = "token";
const PASSWORD = "bf37e0e1-a9b2-4d6a-8266-1c6657c515f2";
const BASEURL = "cr.selcloud.ru/";
const d = new Date();

export const options = {
  vus: 1,
  duration: '30m',
};

export default function testSuite() {

  let registryName = "yahina/";
  let image = "test/ff324/1";
  let tag = ":1.8.3rc1";
  let IMAGE = `${BASEURL}${registryName}${image}${tag}`;
  let res;
  let date = d.toDateString()
  let time = d.toTimeString();
  let start_pull_time;
  let end_pull_time;
  let pull_time;
  let image_size_string;
  let pull_speed;

  console.log("START TIME: ", date, time);

  //we have to be sure that the image doesn't exist
  describe('01. Delete image', (t) => {

    res = exec.command("docker", ["system", "prune", "--volumes", "--all", "--force"]);

     check(res, {
       'Delete image': (r) => r.includes("Total reclaimed space")
     });

     console.log("\nDELETE IMAGE RESPONSE:\n", JSON.stringify(res))
    sleep(1);
  })

  &&

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
  });

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

    pull_time = (end_pull_time - start_pull_time)/1000; //sec

    if (image_size_string.includes('GB')) pull_speed = image_size*1024/pull_time;
    else if (image_size_string.includes('MB')) pull_speed = image_size/pull_time;
    
    console.log(`\nIMAGE:\n${IMAGE}\n\nRESPONSE PULL:\n`, JSON.stringify(res), `\n\nIMAGE SIZE:\n`, image_size_string, `\n\nPULL DURATION:\n${pull_time} sec\n${pull_time/60} min`, `\n\nSPEED:\n${Math.round(pull_speed)} Mb/s`);

    
    // date = d.toDateString();
    // time = d.toTimeString();
    // console.log("END TIME: ", date, time);
  });
/*
  //we have to delete the image for further downloads
  describe('02. Delete image', (t) => {

    let imagesList = (exec.command("docker", ["image", "ls"]));
    let parseARR = imagesList.split('\n')

    parseARR.forEach(line =>{

      console.log("line ", line);

      if (IMAGE.includes(line)) {

          console.log(`SUCCESSFULLY FOUND IMAGE: ${IMAGE}`);
          res = exec.command("docker", [ "rmi", "-f", `${IMAGE}${tag}`]);
          console.log("Delete Image (last case): ", JSON.stringify(res));
      }
    })
    check(res, {
      'Delete image': (r) => r.includes(`Untagged: ${IMAGE}${tag}`)
    });

      sleep(1);
  })*/
}