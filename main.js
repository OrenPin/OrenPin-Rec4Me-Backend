const express = require('express');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const router = express.Router();
const database = require('./database');
const emails = require('./emails');
const cors = require('cors');
const passport = require('passport');
const path = require('path')
const app = express();
require('dotenv').config();
require('./passport');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.use(fileUpload({
    createParentPath: true
}));

//app.use("/",router);



app.post('/log-in', (req,res)=>{
    database.login(req.body.companyID, req.body.companyPassword).then(message =>{                  
        const payload = { companyID: req.body.companyID};
        // creating access token
        const data = {
            token: "Bearer " + jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET),
            message: message
        }
        res.status(200).send(data);
        
    }).catch(err =>{
        console.log(err);
        res.status(500).send(err); // 500 = Server error       
    });
});

app.post('/sign-up', (req,res)=>{
    const data = req.body;
    database.register(data.companyID, data.companyPassword,data.email,
        data.compName,data.establishment,data.domain,data.occupation,
        data.location, data.size, data.numOfManagers, data.numOfEmployees,
        data.numOfCeo, data.systemUsed).then((data) =>{
            res.sendStatus(200);
        }).catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});

// Getting here the files and saving them in 'upload' folder
app.post('/uploadfile', (req,res)=>{
    let file = req.files.file;
    fileName = path.extname(file.name);
    // Checking if the file ends with .xls
    if (fileName == '.xls'){
        //emails.readXLSX(file.name);
    }else if (fileName == '.csv'){ // Checking if the file ends with .csv
        //emails.readCSV(file.name)
    }else{
        res.status(500).send("Wrong type file");
    }
    file.mv('./uploads/' + file.name);
});

// verify access token
app.get('/admin', passport.authenticate('jwt', { session: false }), (req, res) =>{
    res.status(200).send("Approved");
});


const port = 3000
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});
