#! /usr/bin/env node

"use strict"


const { JavaCaller } = require("java-caller");




var http = require("http");

console.log("Starting the web server, go to: http://127.0.0.1:8080/ to test.");

http.createServer(async function(req, res){
    const employees = await getAllEmployees();
    console.log(employees);
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(`
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Employee Manager</title>
    </head>
    <body>
        <table>
            <thead>
                <tr>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr></tr>
            </tbody>
        </table>
    </body>
    </html>
    `);
}).listen(8080);

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

async function callJava(api_endpoint) {
    const java = new JavaCaller({

        classPath: './',  // CLASSPATH as the path to the .class file or jar files if we write ./ it means that the JavaCallerTester.class file is in the same folder

        mainClass: 'Employee',  // the main class we call must be accessible via CLASSPATH,

        rootPath: __dirname,

        minimumJavaVersion: 10

    });

    const { status, stdout, stderr } = await java.run([api_endpoint]);
    return { status, stdout, stderr };
}