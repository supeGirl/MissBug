import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'

import {bugService} from './services-backend/bug.service.js'
import {loggerService} from './services-backend/logger.service.js'
import {pdfService} from './services-backend/pdf.service.js'
import {userService} from './services-backend/user.service.js'

const app = express()

// Config the Express App
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Provide an API for Bugs CRUDL

// Get  bugs list
app.get('/api/bug', (req, res) => {
  // console.log(req.query)

  const filterBy = {
    txt: req.query.txt || '',
    severity: +req.query.severity || 0,
    labels: req.query.labels,
  }
  let sortBy = {
    type: '',
    desc: 1,
  }

  if (req.query.sortBy) {
    try {
      sortBy = JSON.parse(req.query.sortBy)
    } catch (err) {
      console.error('Invalid sortBy parameter:', req.query.sortBy)
    }
  }
  // console.log(sortBy, filterBy)

  if (req.query.pageIdx) filterBy.pageIdx = req.query.pageIdx

  bugService
    .query(filterBy, sortBy)
    .then((bugs) => res.send(bugs))
    .catch((err) => {
      // never show the err to the use (always log it)
      loggerService.error('Cannot get bugs', err)
      res.status(400).send('Cannot get bugs')
    })
})

// Create new bug
app.post('/api/bug', (req, res) => {
  const {loginToken} = req.cookies
  const user = userService.validateToken(loginToken)
  if (!user) return res.status(401).send('Cannot add bug')

  const bug = req.body
  delete user.username
  bug.owner = user

  bugService
    .save(bugToSave, user)
    .then((savedBug) => {
      res.send(savedBug)
    })

    .catch((err) => {
      loggerService.error('Cannot save bug', err)
      res.status(400).send('Cannot save bug', err)
    })
})

// Update bug
app.put('/api/bug/:bugId', (req, res) => {
  const {loginToken} = req.cookies
  const user = userService.validateToken(loginToken)
  if (!user) return res.status(401).send('Cannot add bug')

  const bugId = req.params.bugId
  bugService
    .getById(bugId)
    .then((bug) => {
      if (bug.owner._id !== user._id) {
        return res.status(403).send('You are not the owner of this bug')
      }

      // const bugToSave = {
      //   _id: bugId,
      //   title: req.body.title,
      //   severity: +req.body.severity,
      //   owner: req.body.owner,
      // }

      const bugToSave = req.body

      bugService
        .save(bugToSave, user)
        .then((savedBug) => {
          res.send(savedBug)
        })
        .catch((err) => {
          loggerService.error('Cannot update bug', err)
          res.status(400).send('Cannot update bug', err)
        })
    })
    .catch((err) => {
      loggerService.error('Cannot find bug', err)
      res.status(400).send('Cannot find bug')
    })
})

// Read bug info
app.get('/api/bug/:bugId', (req, res) => {
  const {bugId} = req.params
  let visitedBugIds = req.cookies.visitedBugIds || []
  if (!visitedBugIds.includes(bugId)) visitedBugIds.push(bugId)
  if (visitedBugIds.length > 3) return res.status(401).send('Wait for a bit')
  res.cookie('visitedBugIds', visitedBugIds, {maxAge: 1000 * 60 * 3})
  bugService
    .getById(bugId)
    .then((bug) => {
      res.send(bug)
    })
    .catch((err) => {
      console.error(err.stack)
      loggerService.error('Cannot get bug', err)
      res.status(401).send('Cannot get bug')
    })
})

// Delete bug
app.delete('/api/bug/:bugId', (req, res) => {
  const {loginToken} = req.cookies
  const user = userService.validateToken(loginToken)
  if (!user) return res.status(401).send('Cannot delete bug')

  const {bugId} = req.params
  bugService
    .remove(bugId, user)
    .then(() => res.send(`${bugId} Removed Successfully!`))
    .catch((err) => {
      loggerService.error('Cannot remove bug', err)
      res.status(400).send('Cannot remove bug')
    })
})

// User API
app.get('/api/user', (req, res) => {
  userService
    .query()
    .then((users) => res.send(users))
    .catch((err) => {
      loggerService.error('Cannot load users', err)
      res.status(400).send('Cannot load users')
    })
})

app.get('/api/user/:userId', (req, res) => {
  const {userId} = req.params

  userService
    .getById(userId)
    .then((user) => res.send(user))
    .catch((err) => {
      loggerService.error('Cannot load user', err)
      res.status(500).send('Cannot load user')
    })
})

// Authorize API
app.post('/api/auth/login', (req, res) => {
  const credentials = {
    username: req.body.username,
    password: req.body.password,
  }

  userService
    .checkLogin(credentials)
    .then((user) => {
      if (user) {
        const loginToken = userService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
      } else {
        res.status(401).send('Invalid Credentials')
      }
    })
    .catch((err) => res.status(401).send(err))
})

app.post('/api/auth/signup', (req, res) => {
  const credentials = req.body

  userService.save(credentials).then((user) => {
    if (user) {
      const loginToken = userService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    } else {
      res.status(400).send('Cannot signup')
    }
  })
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('logged-out!')
})

//PDF part
app.get('/pdf', (req, res) => {
  const path = './pdfs/'
  console.log('in pdf')

  bugService.query().then((bugs) => {
    bugs.sort((a, b) => b.createdAt - a.createdAt)
    const rows = bugs.map(({title, description, severity}) => [title, description, severity])
    const headers = ['Title', 'Description', 'Severity']
    const fileName = 'bugs'
    pdfService
      .createPdf({headers, rows, title: 'bugs report', fileName})
      .then(() => {
        console.log(`doc ready`)
        res.setHeader('Content-Type', 'application/pdf')
        // send to the front (like tab in chrome) need direct path
        res.sendFile(`${process.cwd()}/pdfs/${fileName}.pdf`)
        //download to file
        // res.download(`${path}${fileName}.pdf`, 'bugsPdf,pdf')
      })
      .catch((err) => {
        console.error(err)
        loggerService.error(`Cannot download Pdf ${err}`)
        res.send(`We have a problem ,please try again `)
      })
  })
})

// Fallback route
app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
// app.get('/', (req, res) => res.send('Hello there'))

app.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port}/`))
