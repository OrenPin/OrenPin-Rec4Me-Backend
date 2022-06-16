//const bcryptjs = require('bcryptjs');
const {compareSync } = require('bcryptjs');
const {Pool} = require('pg');
const { database } = require('pg/lib/defaults');

const pool = new Pool({
  user: 'fs-info',
  host: '192.114.5.161',
  database: 'fs-info-db',
  password: '123',
  port: 5432,
  "max": 40, // Max 20 connection
  "connectionTimeoutMillis" : 0, // if all the connection are busy, "0" means "wait forever" (we can change it to shorter time)
  "idleTimeoutMillis": 0, // this destroy the connection if it is no use. "0" means never - but we can set any other number and it will be in seconds
})


const login = function(companyID, password){
    return new Promise(function(resolve, reject){
        if(companyID === "" || password === ""){
            reject(false);
        }
        pool.query(`SELECT company_id, password FROM users_info WHERE company_id= 
        ${companyID}`).then(user =>{
            if(!user){ // if the user doesn't exist
                reject(false);
            }
            //if the password is incorrect
            if(!compareSync(password, user.rows[0].password)){
                reject(false);
            }
            else{ // if the user exists and the password is correct
                resolve(1);
            }
        }).catch(err =>{
            console.log(err);
            reject(false);
        })
    })
}

const register = function(companyID, password, email, name, establishment, domain, occupation, location, size, amountManagers,
                         amountEmployees, amountCEO, systemUsed){
        return new Promise(function(resolve, reject){

            // This if checks if these variables are numbers. IF they are not numbers -> reject!
            if(isNaN(companyID) || isNaN(size) || isNaN(amountManagers) || isNaN(amountEmployees) || isNaN(amountCEO)){
                reject(false)
            }
            pool.query(`INSERT INTO users_info (company_id, year_establishment, organization_size, num_of_ceo, num_of_managers, num_of_employees, email, organization_domain, organization_name, occupation, location, organization_system_used, password)
                VALUES( ${companyID} , ${establishment}, ${size} , ${amountCEO} ,${amountManagers},${amountEmployees}, '${email}', '${domain}' , '${name}', '${occupation}' , '${location}' , '${systemUsed}', '${password}' )`).
                then(result => {
                    resolve(1);
                }).catch(e => {
                    console.error(e);
                    reject(e.detail);
                }).then(() => {
                });
        });
}

// This func gets email,password and companyID and saves them in the database.
// Each email is a employee
const saveEmail = function(email, password, companyID){
    return new Promise(function(resolve, reject){

        // Need to write "IF statement" that checks email,password and companyID not nulls or empty strings
        pool.query(`INSERT INTO users_email (email, password, company_id, is_done)
            VALUES( '${email}' , '${password}' , ${companyID} , False )`).
            then(result => {
                resolve(1);
            }).catch(e => {
                console.error(e.detail);
                reject(e.detail);
            }).then(() => {
            });
    });
}

module.exports = {register, login, saveEmail};
const findUser = function(companyID){
    return new Promise(function(resolve, reject){
        pool.query(`SELECT company_id, password FROM users_info WHERE company_id= ${companyID}`)
        .then(user =>{
                resolve(user);
            }).catch(err =>{
                reject(err);
            });
    });
}

module.exports = {register, login, findUser};