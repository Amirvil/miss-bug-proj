import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'

import { bugService } from './services/bug.service.js'

const app = express()
app.use(cookieParser())
app.use(express.static('public'))
app.set('query parser', 'extended')
app.use(express.json())

app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        labels: req.query.labels || '',
        sortBy: req.query.sortBy || '',
        sortDir: +req.query.sortDir || 1,
        pageIdx: req.query.pageIdx !== undefined ? +req.query.pageIdx : undefined
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
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
    const { title, description, severity, labels } = req.body
    if (!title || severity === undefined) return res.status(400).send('Missing required fields')
    const bugToSave = {
        title,
        description,
        severity: +severity || 1,
        labels: labels || [],
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            res.status(400).send('Cannot save bug')
        })
})

app.put('/api/bug/:bugId', (req, res) => {
    const { title, description, severity, labels, _id } = req.body

    if (!_id || !title || severity === undefined) return res.status(400).send('Missing required fields')
    const bug = {
        _id,
        title,
        description,
        severity: +severity,
        labels: labels || [],
    }

    bugService.save(bug)
        .then(savedBug => {
            res.send(savedBug)
        })
        .catch(err => {
            res.status(400).send('Cannot save bug')
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    bugService.remove(bugId)
        .then(() => {
            res.send('Removed!')
        })
        .catch(err => {
            res.status(400).send('Cannot get bug')
        })
})

app.listen(5501, () => console.log('Server ready at port http://127.0.0.1:5501'))

app.get('*splat', (req, res) => {
    res.sendFile(path.resolve('public', 'index.html'))
})
