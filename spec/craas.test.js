import exec from 'k6/x/exec';
import { sleep, group, check } from "k6";
import { describe } from 'https://jslib.k6.io/expect/0.0.5/index.js';
import { Trend } from 'k6/metrics';
import execution from 'k6/execution';

const baseUrl = "stage-envoy.cr.selcloud.org/";
const registryName = "kar/";
const images = ["rediska","postgres","hello"]

export let options = {
  stages: [
    { duration: '5m', target: 30 }, // simulate ramp-up of traffic from 1 to 6 users over 5 minutes.
    //{ duration: '10m', target:  }, // stay at 6 users for 10 minutes
    //{ duration: '1m', target: 3 }, // ramp-up to 8 users over 5 minutes 
    //{ duration: '1m', target: 3 }, // stay at 8 users for for 10 minutes
    //{ duration: '1s', target: 0 }, // ramp-down to 0 users
  
  ],
};


function getRandomFromArr(arr) {
  let i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

let imagesHub = ["ubuntu",
                      "redis",
                      "couchbase",
                      "mysql",
                      "rabbitmq",
                      "centos",
                      "tomcat",
                      "debian",
                      "sonarqube",
                      "nextcloud",
                      "php",
                      "bash",
                      "docker",
                      "maven",
                      "node",
                      "amazonlinux",
                      "caddy",
                      "eclipse-mosquitto",
                      "telegraf",
                      "cassandra",
                      "chronograf",
                      "vault",
                      "adminer",
                      "ghost",
                      "matomo",
                      "logstash",
                      "gradle",
                      "mongo-express",
                      "swarm",
                      "rethinkdb"
              ];
let current_image =  getRandomFromArr(imagesHub);

export default function testSuite() {
  
  /*describe('01. Delete', (t) => {

    let imagesList = (exec.command("docker", ["image", "ls"]));

    let parseARR = imagesList.split('\n')

    parseARR.forEach(line =>{
      if (line.includes(baseUrl + registryName + images[1])) {
          console.log("FOUND");
          console.log("LINE: ", line);
          
          console.log("\nDELETE: ", exec.command("docker", [ "rmi", "-f", "stage-envoy.cr.selcloud.org/kafr/postgres:latest"]));
      }
    })
  })

  &&*/


  describe('02. Pull', (t) => {
    let start = new Date() - new Date(execution.scenario.startTime);

    const resp = exec.command("docker",["pull", `${current_image}`]);
    console.log("\nRES: ", resp);
    
    sleep(1);

    let end = new Date() - new Date(execution.scenario.startTime);

    console.log(`Duration:  ${end - start}ms  `);
  })

  &&

  describe('03. Delete', (t) => {

    let imagesList = (exec.command("docker", ["image", "ls"]));

    //let parseARR = imagesList.split('\n')
    console.log("\nDELETE: ", exec.command("docker", [ "rmi", "-f", `${current_image}`]));
    /*parseARR.forEach(line =>{
      if (line.includes(baseUrl + registryName + images[1])) {
          console.log("FOUND");
          console.log("LINE: ", line);
          
          console.log("\nDELETE: ", exec.command("docker", [ "rmi", "-f", `${current_image}`]));
      }
    })*/
  
  })
}