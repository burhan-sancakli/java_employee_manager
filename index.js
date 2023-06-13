#! /usr/bin/env node

"use strict"


const { JavaCaller } = require("java-caller");




var http = require("http");
const fs = require('fs');
const url = require('url');
const path = require("path");
const mimeLookup = {
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.svg': 'image/svg+xml'
  };

function send404(response){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: Resource not found.');
    response.end();
}
function send500(response){
    response.writeHead(500, {'Content-Type': 'text/plain'});
    response.write('Error 500: Server Error');
    response.end();
}
console.log("Starting the web server, go to: http://127.0.0.1:8080/ to test.");
const server = http.createServer(async function(req, res){
    res.statusCode = 200;
    try {
        if(req.method === "GET"){
            if(req.url=="/"){
                res.writeHead(200,{"Content-Type": "text/html"});
                const fileContent = fs.readFileSync("employee_manager_client/build/index.html");
                res.end(fileContent, 'utf-8');
            } else if(req.url == "/favicon.ico"){
                res.setHeader('Content-Type', 'image/x-icon');
                fs.createReadStream("favicon.ico").pipe(res);
            } else if(req.url == "/get-all-employees"){
                const employees = await getAllEmployees();
                res.writeHead(200,{'Content-Type': 'application/json'});
                res.end(JSON.stringify(employees), 'utf-8');    
            } else if(req.url.startsWith("/get-employees-total-work-amount")){
                const parsedUrl = url.parse(req.url, true);
                const query = parsedUrl.query;
                const ids = query.ids.split(',').map(String);
                const employeesTotalWorkAmount = await getEmployeesTotalWorkAmount(ids);
                res.writeHead(200,{'Content-Type': 'application/json'});
                res.end(JSON.stringify(employeesTotalWorkAmount), 'utf-8');
            } else if(req.url.startsWith("/get-employees-age-and-service")){
                const parsedUrl = url.parse(req.url, true);
                const query = parsedUrl.query;
                const ids = query.ids.split(',').map(String);
                const employeesAgeAndService = await getEmployeesAgeAndService(ids);
                res.writeHead(200,{'Content-Type': 'application/json'});
                res.end(JSON.stringify(employeesAgeAndService), 'utf-8');
            } else if(req.url.startsWith("/get-employees-older-than/")){
                const age = req.url.split("?")[0].split("/")[2]; // Extract the ID from the URL
                const parsedUrl = url.parse(req.url, true);
                const query = parsedUrl.query;
                const ids = query.ids.split(',').map(String);
                const employees = await getEmployeesOlderThan(age,ids);
                res.writeHead(200,{'Content-Type': 'application/json'});
                res.end(JSON.stringify(employees), 'utf-8');
                
            } else {
                let filepath = path.resolve('./employee_manager_client/build/' + req.url);

                let fileExt = path.extname(filepath);
                let mimeType = mimeLookup[fileExt];

                if(!mimeType) {
                    send404(res);
                    return;
                }

                fs.exists(filepath, (exists) => {
                    if(!exists){
                        send404(res);
                        return;
                    }

                    res.writeHead(200, {'Content-Type': mimeType});
                    fs.createReadStream(filepath).pipe(res);
                });
                
            }
            
        
        }
        else if(req.method === "POST"){  // unused
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
            } else {
                send404();
                return;
            }
        }
    } catch(e) {
        console.log(e);
        send500(res);
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

async function getEmployeesTotalWorkAmount(ids){
    try {
        var { status, stdout, stderr } = await callJava("get-employees-total-work-amount", ids);
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

async function getEmployeesOlderThan(age,ids){
    try {
        var { status, stdout, stderr } = await callJava("get-employees-older-than", [age, ...ids]);
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