const csv = require('csv-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const { type } = require('os');
const mailgun = require("mailgun-js");
const database = require('./database');
require('dotenv').config();
const mg = mailgun({apiKey: process.env.API_KEY, domain: process.env.DOMAIN});

// This func reads CSV file, and create from each email "username" = email and password.
// For example: DavidDoe@gmail.com = email, password = DavidDoe
function readCSV(fileName, companyID){
    fs.createReadStream(fileName)
    .pipe(csv({
        delimiter:","
    })
    ).on('headers', (headers) => {
        head = headers[0];
    })
    .on('data', (row) => {
        if(row[head] != undefined){
            email = row[head];
            password = row[head].split("@")[0]; // Split the email before @ and after - and take only the before
            console.log(email);
            console.log(password);
            database.saveEmail(email, password, companyID); // saving every email and password on the database
            sendEmail(email, password, companyID); // sending email to the employee
        }
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });
}

// This func reads XL file, and create from each email "username" = email and password.
function readXLSX(fileName, companyID){
    var xl = XLSX.readFile(fileName);
    const sheets = xl.SheetNames;
    const temp = XLSX.utils.sheet_to_json(xl.Sheets[sheets], {
        header: 1,
        defval: '',
        blankrows: true
    });
    temp.forEach((res) => {
        email = res[0];
        password = res[0].split("@")[0]; // Split the email before @ and after - and take only the before
        database.saveEmail(email, password, companyID); // saving every email and password on the database
        sendEmail(email, password, companyID); // sending email to the employee
    })
}

// Sending email to every employee.
// Email include "USERNAME" (we can change it to EMAIL), password and link to the website
// The with the username/email and password, the employee needs to login to the website
function sendEmail(email, password, companyID){
    const data = {
        from: process.env.DOMAIN,
        to: email,
        subject: 'Hello',
        text: `Your username is: ${email} and your password is: ${password}
               link: www.rec4me/questions/${companyID}`
    };
    mg.messages().send(data, function (error, body) {
        if(error){
            console.log(error);
        }else{
            console.log(body);
        }
    });
}