require('dotenv').config() // loads variables from .env file into process.env
const express = require('express')
const app = express()
const mysql = require('mysql2')
const bodyParser = require('body-parser') // parse incoming request bodies in a middleware stored under req.body
const session = require('express-session') // imports the express session middleware, provides session management
const path = require('path') // uses the path module, needed for working with file and directory paths
const PORT = process.env.PORT

const connection = mysql.createConnection({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME
}) // start of connection to server using my env file

connection.connect(err => {
   if (err) {
       console.error('Error connecting to MySQL:', err)
       return
   }
   console.log('Connected to MySQL')
}) // test messages

app.use(bodyParser.urlencoded({ extended: true })) // tells express to use bodyParser for encoded bodies

app.use(session({ // tells express to use session middleware for management
   secret: 'secret_key',
   resave: false,
   saveUninitialized: true
})) // this block is needed for user specific details, secret is used to sign cookies, resave:false makes sure session is only saved when needed/changed, save:true keeps the session up for the client even if unchanged

// Serve static files directly from the root directory
app.use(express.static(path.join(__dirname))) 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index002.html')) // serve the main HTML file
})

app.post('/login', (req, res) => { // route for login
   const { username, password } = req.body // destructuring
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
       res.redirect('/user-info') // redirect to user info page after login
   })
}) // if statements for login attempts, 

app.get('/user-info', (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
        return
    }
    const user = req.session.user
    const userInfoHTML = `
        <h2>User Info</h2>
        <p>Full Name: ${user.FirstName} ${user.LastName}</p>
        <p>Department: ${user.Department}</p>
        <p>Job Title: ${user.JobTitle}</p>
        <p>Annual Salary: ${user.Salary}</p>
        <a href="/logout">Logout</a>
    `
    res.send(userInfoHTML)
})

app.post('/submit', (req, res) => { // route for submissions
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

app.get('/employees', (req, res) => { // route for the employee table
   connection.query('SELECT EmployeeID, FirstName, LastName, Department, JobTitle, StartDate FROM employees', (err, results) => {
       if (err) {
           console.error('Error fetching data:', err)
           res.status(500).send('Error fetching data from database')
           return
       }

       let tableHTML = `<h2>Employee Table</h2>
           <table border="2">
           <tr>
               <th>EmployeeID</th>
               <th>FirstName</th>
               <th>LastName</th>
               <th>Department</th>
               <th>JobTitle</th>
               <th>StartDate</th>
           </tr>`

       results.forEach(row => {
           tableHTML += `<tr>
               <td>${row.EmployeeID}</td>
               <td>${row.FirstName}</td>
               <td>${row.LastName}</td>
               <td>${row.Department}</td>
               <td>${row.JobTitle}</td>
               <td>${row.StartDate}</td>
           </tr>`
       })

       tableHTML += `</table>`
       res.send(tableHTML)
   })  // table creation
})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err)
            res.status(500).send('Error logging out')
            return
        }
        res.clearCookie('connect.sid')
        res.redirect('/')
    })
}) // route for logging out

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`)
}) // sets port for site
