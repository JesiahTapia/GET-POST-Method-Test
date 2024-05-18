require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require ('mysql2')
const PORT = process.env.PORT
const bodyParser = require('body-parser')



const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect()

app.use(bodyParser.urlencoded({extended: true}))

// Route to display the form
app.get('/form', (req, res) => {
    res.render('form'); // Assuming you're using a templating engine like EJS or Pug
});


app.post('/submit', (req, res) => {
   const {fname, lname, dept, salary, jobtitle, hireDate,} = req.body; // Extract form data
   // Insert data into your database
   // Example with MySQL:
    const userDetails = {
  FirstName: fname, LastName: lname, Department: dept, Salary: salary, JobTitle: jobtitle, StartDate: hireDate,
    }

   connection.query('INSERT INTO employees SET ? ', userDetails, (err, result) => {
       if (err) {
           console.error(err);
           res.status(500).send('Error inserting data into database');
       } else {
           res.status(200).send('Data inserted successfully');
       }
   });
});


app.listen(PORT,() => {
    console.log(`appislistening${PORT}`);
})





