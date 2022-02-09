import exec from 'k6/x/exec';
import { sleep, group, check } from "k6";
import { describe } from 'https://jslib.k6.io/expect/0.0.5/index.js';
import { Trend } from 'k6/metrics';
import execution from 'k6/execution';

const BASEURL = "cr.selcloud.ru/";

export const options = {
  vus: 1,
  duration: '1m',
};

const USERNAME = "token";
const PASSWORD = "bf37e0e1-a9b2-4d6a-8266-1c6657c515f2";

export default function testSuite() {

  let registryName = "yahina/";
  let image = "9gbimage";
  let tag = ":latest";
  let IMAGE = `${BASEURL}${registryName}${image}`;
  let res;

  
  //we have to be sure that the image doesn't exist
  describe('01. Delete image', (t) => {

    
      //console.log("line ", line);docker system prune --volumes --all
    res = exec.command("docker", [ "system", "prune", "--volumes", "--all", "-f"]);

    check(res, {
      'Delete image': (r) => r.includes == (`Total reclaimed space`)
    });

    console.log("Delete image (01): ", JSON.stringify(res))
    sleep(1);
  })

  &&

  //login to craas to be able to download images
  describe('02. Login', (t) => {

    let start = new Date() - new Date(execution.scenario.startTime);

    res = exec.command("docker", ["login", `${BASEURL}`, "-u", `${USERNAME}`, "-p", `${PASSWORD}`]);
    console.log("\nLogin: ", JSON.stringify(res));
    
    let end = new Date() - new Date(execution.scenario.startTime);

    console.log(`Duration:  ${end - start}ms ${IMAGE} `);

    check(res, {
      'Login': (r) => r.includes(`Login Succeeded`)
    });

    sleep(1);
  })

  &&

  //execution of 'docker pull <image> command'
  describe('03. Pull', (t) => {
    let start = new Date() - new Date(execution.scenario.startTime);

    const res = exec.command("docker",["pull", `${IMAGE}`]);
    console.log("\nPull Image: ", JSON.stringify(res));
    
    let end = new Date() - new Date(execution.scenario.startTime);

    console.log(`Duration:  ${end - start}ms ${IMAGE} `);

    check(res, {
       'Pull': (r) => r.includes(`Status: Downloaded newer image`)
     });

    sleep(1);
  })

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
  })
}