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
  let image = "3gbimag2e";
  let tag = ":latest";
  let IMAGE = `${BASEURL}${registryName}${image}${tag}`;
  let res;
  let text = d.toDateString();
  let time = d.toTimeString();

  console.log("START TIME: ", text, time);

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
    let start = new Date() - new Date(execution.scenario.startTime);

    res = exec.command("docker",["pull", `${IMAGE}`]);
    check(res, {
       'Pull': (r) => r.includes(`Status: Downloaded newer image`)
     });

    let end = new Date() - new Date(execution.scenario.startTime);

    let pull_time = (end - start)/1000; //sec
    let image_size = 9.6*1024; //mb
    let speed = image_size/pull_time;
    console.log(`\nIMAGE:\n${IMAGE}\n\nRESPONSE PULL:\n`, JSON.stringify(res), `\n\nPULL DURATION:\n${pull_time/60}min`, `\n\nSPEED:\n${speed}Mb/s`);
    sleep(1);
    console.log("END TIME: ", text, time);
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