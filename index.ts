import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'
import fs from 'fs'


const app = express()
const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"
app.use(bodyParser.json())
app.use(cors())

interface JWTPayload {
  username: string;
  password: string;
}

const readDbFile = () => {
  const raw = fs.readFileSync('db.json', 'utf8')
  const db = JSON.parse(raw)
  return db
}

app.post('/login',
  (req, res) => {

    const { username, password } = req.body
    // Use username and password to create token.

    return res.status(200).json({
      message: 'Login succesfully',
    })
    const { username, password } = req.body
    const db = readDbFile()
    const user = db.users.find((data : any) => data.username === username)
    if (!user) {
      res.status(400)
      res.json({ message: "Invalid username or password" })
      return
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(400)
      res.json({ message: "Invalid username or password" })
      return
    }
    const token = jwt.sign({username: user.username,password: user.password } as JWTPayload , SECRET)
    return res.status(200).json({ message:"Login successfully", token})
  })

app.post('/register',
  (req, res) => {

    const { username, password, firstname, lastname, balance } = req.body
    const errors = validationResult(req)
      const db = readDbFile()
      if (db.users.find((data: any) => data.username == username)) {
        res.status(400).json({message: "This username is already in used."})
        return
      }
      const passwordhasher = bcrypt.hashSync(password, 16)
      db.users.push({
        id: Date.now(),
        username,
        password: passwordhasher,
        balance 
      })
      fs.writeFileSync('db.json', JSON.stringify(db))
      res.status(200).json({ message: "Register complete" })
      res.status(400).json({ message: "Invalid username or password" })
    })

app.get('/balance',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
      const db = readDbFile()
      const user = db.users.find((data : any) => data.username === username)
      if(user){
        res.status(200).json({user.username,user.balance})
      }else{
        res.status(400).json({user.message})
      }
    }
    catch (e) {
      //response in case of invalid token
    }
  })

app.post('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {

    //Is amount <= 0 ?
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ message: "Invalid data" })
  })

app.post('/withdraw',
  (req, res) => {
  })

app.delete('/reset', (req, res) => {

  //code your database reset here
  fs.writeFileSync('db.json', JSON.stringify({users:[]}))
  return res.status(200).json({
    message: 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))