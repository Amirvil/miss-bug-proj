import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'

import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'

const app = express()
app.use(cookieParser())
app.use(express.static('public'))
app.set('query parser', 'extended')
app.use(express.json())

// REST API for Bugs

app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        labels: req.query.labels || '',
        sortBy: req.query.sortBy || '',
        sortDir: +req.query.sortDir || 1,
        pageIdx: req.query.pageIdx !== undefined ? +req.query.pageIdx : undefined,
        creatorId: req.query.creatorId || ''
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.get('/api/bug/labels', (req, res) => {
    bugService.getLabels()
        .then(labels => res.send(labels))
        .catch(err => {
            console.error('Cannot get labels:', err)
            res.status(400).send('Cannot get labels')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    let visitedBugs = req.cookies.visitedBugs || []
    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) {
            console.log('User blocked: limit reached')
            return res.status(401).send('Wait for a bit')
        }
        visitedBugs.push(bugId)
    }

    res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
    console.log(`User visited the following bugs: [${visitedBugs.join(', ')}]`)

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            res.status(400).send('Cannot get bug')
        })
})

app.post('/api/bug', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not logged in')

    const { title, description, severity, labels } = req.body
    if (!title || severity === undefined) return res.status(400).send('Missing required fields')
    const bugToSave = {
        title,
        description,
        severity: +severity || 1,
        labels: labels || [],
        creator: {
            _id: loggedinUser._id,
            fullname: loggedinUser.fullname
        }
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            res.status(400).send('Cannot save bug')
        })
})

app.put('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not authenticated')

    const { bugId } = req.params
    const bugToSave = req.body

    bugService.getById(bugId)
        .then(bug => {
            if (bug.creator._id !== loggedinUser._id && !loggedinUser.isAdmin) {
                return Promise.reject('Not authorized: You can only edit your own bugs')
            }
            return bugService.save(bugToSave)
        })
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            console.log('Error:', err)
            // If the error is our 'Not authorized' string, send 403
            if (err === 'Not authorized') {
                return res.status(403).send(err)
            }
            res.status(400).send(err || 'Cannot edit bug')
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not authenticated')
    const { bugId } = req.params

    bugService.getById(bugId)
        .then(bug => {
            const isOwner = bug.creator._id === loggedinUser._id
            const isAdmin = loggedinUser.isAdmin

            if (!isOwner && !isAdmin) {
                return Promise.reject('Not authorized: You can only delete your own bugs')
            }

            return bugService.remove(bugId)
        })
        .then(() => res.send('Deleted successfully'))
        .catch(err => {
            console.log('Error:', err)
            // If the error is our 'Not authorized' string, send 403
            if (err === 'Not authorized') {
                return res.status(403).send(err)
            }
            res.status(400).send(err || 'Cannot remove bug')
        })
})

// Auth API

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    console.log('1. Signup request received')

    userService.add(credentials)
        .then(user => {
            console.log('2. User added to file')

            try {
                const loginToken = authService.getLoginToken(user)
                console.log('3. Token generated successfully')
                res.cookie('loginToken', loginToken)
                res.send(user)
            } catch (err) {
                console.error('CRASH in Token Generation:', err)
                res.status(500).send('Token error')
            }
        })
        .catch(err => {
            console.error('4. Signup failed in service:', err)
            res.status(400).send('Username taken.')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

// User API
app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

app.delete('/api/user/:userId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser || !loggedinUser.isAdmin) {
        return res.status(403).send('Admin clearance required')
    }

    const { userId } = req.params

    if (loggedinUser._id === userId) {
        return res.status(400).send('You cannot delete yourself')
    }

    userService.remove(userId)
        .then(() => res.send('User removed'))
        .catch(err => res.status(400).send('Cannot remove user'))
})

app.listen(5501, () => console.log('Server ready at port http://127.0.0.1:5501'))

app.get('*splat', (req, res) => {
    res.sendFile(path.resolve('public', 'index.html'))
})
