require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const session = require('express-session')
const PORT = process.env.PORT


const connection = mysql.createConnection({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME
})


connection.connect(err => {
   if (err) {
       console.error('Error connecting to MySQL:', err)
       return
   }
   console.log('Connected to MySQL')
})


app.use(bodyParser.urlencoded({ extended: true }))


app.use(session({
   secret: 'secret_key',
   resave: false,
   saveUninitialized: true
}))


app.post('/login', (req, res) => {
   const { username, password } = req.body
   console.log('Login attempt:', req.body) 


   connection.query('SELECT * FROM employees WHERE UserName = ?', [username], (err, results) => {
       if (err) {
           console.error(err)
           res.status(500).send('Error querying the database')
           return
       }


       if (results.length === 0) {
           console.log('No user found with username:', username)
           res.status(401).send('Invalid username or password')
           return
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

