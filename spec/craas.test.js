import exec from 'k6/x/exec';
import { sleep, group, check } from "k6";
import { describe } from 'https://jslib.k6.io/expect/0.0.5/index.js';
import { Trend } from 'k6/metrics';
import execution from 'k6/execution';

const baseUrl = "cr.selcloud.ru/";

export const options = {
  vus: 1,
  duration: '20m',
};

const username = "token";
const password = "bf37e0e1-a9b2-4d6a-8266-1c6657c515f2";

export default function testSuite() {

  let registryName = "yahina/";
  let image = "3gbimag2e";
  let tag = ":latest";
  let current_image = `${baseUrl}${registryName}${image}`;

  
  //we have to be sure that the image doesn't exist
  describe('01. Delete image', (t) => {

    let imagesList = (exec.command("docker", ["image", "ls"]));
    let res;
    let parseARR = imagesList.split('\n')
    parseARR.forEach(line =>{
      console.log("line ", line);
      if (current_image.includes(line)) {
          console.log(`FOUND IMAGE: ${current_image}`);
          res = exec.command("docker", [ "rmi", "-f", `${current_image}${tag}`]);
          console.log("RES: ", res);
      } else {
        console.log(`The image ${current_image} doesn't exist locally`)
      }
    })
    check(res, {
      'Delete image': (r) => r.includes(`Untagged: ${current_image}${tag}`)
    });

      sleep(1);
  })

  &&

  //login to craas to be able to download images
  describe('02. Login', (t) => {

    let start = new Date() - new Date(execution.scenario.startTime);

    const res = exec.command("docker", ["login", `${baseUrl}`, "-u", `${username}`, "-p", `${password}`]);
    console.log("\nRES: ", res);
    
    let end = new Date() - new Date(execution.scenario.startTime);

    console.log(`Duration:  ${end - start}ms ${current_image} `);

    check(res, {
      'Login': (r) => r.includes(`Login Succeeded`)
    });

    sleep(1);
  })

  &&

  //execution of 'docker pull <image> command'
  describe('03. Pull', (t) => {
    let start = new Date() - new Date(execution.scenario.startTime);

    const res = exec.command("docker",["pull", `${current_image}`]);
    console.log("\nRES: ", res);
    
    let end = new Date() - new Date(execution.scenario.startTime);

    console.log(`Duration:  ${end - start}ms ${current_image} `);

    check(res, {
       'Pull': (r) => r.includes(`Status: Downloaded newer image`)
     });

    sleep(1);
  })

  //we have to delete the image for further downloads
  describe('02. Delete image', (t) => {

    let imagesList = (exec.command("docker", ["image", "ls"]));
    let res;
    let parseARR = imagesList.split('\n')
    parseARR.forEach(line =>{
      console.log("line ", line);
      if (current_image.includes(line)) {
          console.log(`SUCCESSFULLY FOUND IMAGE: ${current_image}`);
          res = exec.command("docker", [ "rmi", "-f", `${current_image}${tag}`]);
          console.log("RES: ", res);
      }
    })
    check(res, {
      'Delete image': (r) => r.includes(`Untagged: ${current_image}${tag}`)
    });

      sleep(1);
  })
}