require('dotenv').config() // loads variables from .env file into process.env
const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser') // parse incoming request bodies in a middleware stored under req.body
const session = require('express-session') // middleware for creating sessions
const app = express() //use express app
const PORT = process.env.PORT // use port stored in env file
// use imported tools 

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})      // beginning of connection to mysql

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err)
        return
    }
    console.log('Connected to MySQL')
}) // connection to database

app.use(bodyParser.urlencoded({ extended: true })) // needed to parse encoded objects

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
})) // starts middleware session, resave prevents the session from ending until used, uninitialized saves a session that is new but not modified

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html') 
}) // define the route for the root URL, --dirnamegives the name of current directories module, /login.html sends the file

app.post('/login', (req, res) => {  // define route for login URL
    const { username, password } = req.body
    connection.query('SELECT * FROM users WHERE UserName = ?', [username], (err, results) => { // uses the variables provided to select a username
        if (err) {
            console.error(err)
            res.status(500).send('Error querying the database')
            return
        }

        if (results.length === 0 || results[0].Password !== password) { // if no users are found and/or the details dont match, display message
            res.status(401).send('Invalid username or password')
            return
        }

        const user = results[0]    // if user details match, display message.
        req.session.user = user
        res.status(200).send(`Hello ${user.FirstName}, you are logged in!`)
    })
})

app.post('/submit', (req, res) => { // defines route for /submit URL
    const { uName, password, fName, lName } = req.body

    const userDetails = {
        UserName: uName,
        Password: password,
        FirstName: fName,
        LastName: lName
    }

    connection.query('INSERT INTO users SET ?', userDetails, (err, result) => { // looks into mysql table for matches to select
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data into database')
        } else {
            res.status(200).send('Data inserted successfully')
        }
    })
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})
 // start the server and display message if working