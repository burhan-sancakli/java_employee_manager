#! /usr/bin/env node

"use strict"


const { JavaCaller } = require("java-caller");




var http = require("http");
const fs = require('fs');
const url = require('url');

console.log("Starting the web server, go to: http://127.0.0.1:8080/ to test.");

const server = http.createServer(async function(req, res){
    res.statusCode = 200;
    if(req.method === "GET"){
        if(req.url=="/"){
            res.writeHead(200,{"Content-Type": "text/html"});
            const fileContent = fs.readFileSync("index.html");
            res.end(fileContent, 'utf-8');
        } else if(req.url == "/favicon.ico"){
    
        } else if(req.url == "/get-all-employees"){
            const employees = await getAllEmployees();
            res.writeHead(200,{'Content-Type': 'application/json'});
            res.end(JSON.stringify(employees), 'utf-8');
    
        } else if(req.url.startsWith("/get-employee-detail/")){  // TODO
            const id = parseInt(req.url.split("/")[2]); // Extract the ID from the URL
            if (id > 0){
                const employee = null;//await getAllEmployees();
                res.writeHead(200,{'Content-Type': 'application/json'});
                res.end(JSON.stringify(employee), 'utf-8');
            }
        } else if(req.url.startsWith("/get-employees-age-and-service")){
            const parsedUrl = url.parse(req.url, true);
            const query = parsedUrl.query;
            const ids = query.ids.split(',').map(String);

            const employeesAgeAndService = await getEmployeesAgeAndService(ids);
            res.writeHead(200,{'Content-Type': 'application/json'});
            res.end(JSON.stringify(employeesAgeAndService), 'utf-8');
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not found');
        }
        
    
    }
    else if(req.method === "POST"){
        if(req.url == "/get-employees-age"){
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString(); // Accumulate the request body data
            });
            req.on("end", async () => {
                const request_data = JSON.parse(body);  // Parse the JSON data
                res.writeHead(200,{'Content-Type': 'application/json'});
                res.end(JSON.stringify(request_data), 'utf-8');
            });
        }
    }
});
server.listen(process.env.PORT || 8080);

async function getEmployeesAgeAndService(ids){
    try {
        var { status, stdout, stderr } = await callJava("get-employees-age-and-service", ids);
        if(stdout) {
            stdout = Buffer.from(stdout, 'base64').toString('utf-8');
            return JSON.parse(stdout);
        }
        if(stderr){
            console.log(stderr);
        }
    } catch (err) {
        console.error("Nepričakovana napaka: " + err.message + "\n" + err.stack);
    }
    return [];
}

async function getAllEmployees(){
    try {
        var { status, stdout, stderr } = await callJava("get-all-employees");
        if(stdout) {
            stdout = Buffer.from(stdout, 'base64').toString('utf-8');
            return JSON.parse(stdout);
        }
        if(stderr){
            console.log(stderr);
        }
    } catch (err) {
        console.error("Nepričakovana napaka: " + err.message + "\n" + err.stack);
    }
    return [];
}

async function callJava(api_endpoint, args) {
    if (!args) { args = [] }
    const java = new JavaCaller({

        classPath: './',  // CLASSPATH as the path to the .class file or jar files if we write ./ it means that the JavaCallerTester.class file is in the same folder

        mainClass: 'Employee',  // the main class we call must be accessible via CLASSPATH,

        rootPath: __dirname,

        minimumJavaVersion: 10

    });
    const { status, stdout, stderr } = await java.run([api_endpoint, ...args]);
    return { status, stdout, stderr };
}