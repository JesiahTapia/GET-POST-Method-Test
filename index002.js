require('dotenv').config() // loads variables from .env file into process.env
const express = require('express')
const app = express()
const mysql = require('mysql2')
const bodyParser = require('body-parser') // parse incoming request bodies in a middleware stored under req.body
const session = require('express-session')
const PORT = process.env.PORT
// use imported tools 

const connection = mysql.createConnection({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME
})
// beginning of connection to mysql

connection.connect(err => {
   if (err) {
       console.error('Error connecting to MySQL:', err)
       return
   }
   console.log('Connected to MySQL')
})// connection to database


app.use(bodyParser.urlencoded({ extended: true })) // needed to parse encoded objects


app.use(session({
   secret: 'secret_key',
   resave: false,
   saveUninitialized: true
}))  // starts middleware for session, resave prevents the session from ending until used, uninitialized saves a session that is new but not modified



app.post('/login', (req, res) => {
   const { username, password } = req.body
   console.log('Login attempt:', req.body) 


   connection.query('SELECT * FROM employees WHERE UserName = ?', [username], (err, results) => {
       if (err) {
           console.error(err)
           res.status(500).send('Error querying the database')
           return
       } // uses the variables provided to select a username, query checks every option
      


       if (results.length === 0) {
           console.log('No user found with username:', username)
           res.status(401).send('Invalid username or password')
           return // if no users are found and/or the details dont match, display message
       }


       const user = results[0]
       if (user.Password !== password) {
           console.log('Incorrect password for user:', username) 
           res.status(401).send('Invalid username or password')
           return
       }


       req.session.user = user
       res.status(200).send(`Hello ${user.FirstName}, you are logged in! Full Name: ${user.FirstName} ${user.LastName}, Department is ${user.Department} and current position is ${user.JobTitle}. Annual Salary: ${user.Salary}`)
   })
})


app.post('/submit', (req, res) => {
   const { fname, lname, dept, salary, jobtitle, hireDate, uname, password } = req.body
   const userDetails = {
       FirstName: fname,
       LastName: lname,
       Department: dept,

       Salary: salary,
       JobTitle: jobtitle,
       StartDate: hireDate,
       UserName: uname,
       Password: password
   }


   connection.query('INSERT INTO employees SET ?', userDetails, (err, result) => {
       if (err) {
           console.error(err)
           res.status(500).send('Error inserting data into database')
       } else {
           res.status(200).send('Data inserted successfully')
       }
   })
})


app.listen(PORT, () => {
   console.log(`App is listening on port ${PORT}`)
})

