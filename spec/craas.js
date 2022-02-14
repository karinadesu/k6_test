import exec from 'k6/x/exec';
import { sleep, group, check } from 'k6';
import { describe } from 'https://jslib.k6.io/expect/0.0.5/index.js';

import execution from 'k6/execution';

const USERNAME = "token";
const PASSWORD = "bf37e0e1-a9b2-4d6a-8266-1c6657c515f2";
const BASEURL = "cr.selcloud.ru/";

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
  
  //we have to be sure that the image doesn't exist
  describe('01. Delete image', (t) => {

    const d = new Date();
    let text = d.toDateString();
    console.log(text);

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
    let image_size = 9.03; //mb
    let speed = image_size/pull_time;
    
    console.log(`\nIMAGE:\n${IMAGE}\n\nRESPONSE PULL:\n`, JSON.stringify(res), `\n\nPULL DURATION:\n${pull_time/60}min`, `\n\nSPEED:\n${speed}Mb/s`);
    sleep(1);
  });
}