import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'

import { bugService } from './services/bug.service.js'

const app = express()
app.use(cookieParser())
app.use(express.static('public'))

app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        paginationOn: req.query.paginationOn === 'true',
        pageIdx: req.query.pageIdx || 0,
    }
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            res.status(400).send('Cannot get bugs')
        })
})

app.get('/api/bug/save', (req, res) => {
    const { title, description, severity, _id } = req.query
    const bugToSave = {
        title,
        description,
        severity: +severity,
    }

    // Only add the _id if we are performing an UPDATE
    if (_id) bugToSave._id = _id

    // Clean up empty fields
    for (const key in bugToSave) {
        if (bugToSave[key] === undefined) delete bugToSave[key]
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            res.status(400).send('Cannot save bug')
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

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params

    bugService.remove(bugId)
        .then(() => res.send('Removed!'))
        .catch(err => {
            res.status(400).send('Cannot get bug')
        })
})

app.listen(5501, () => console.log('Server ready at port http://127.0.0.1:5501'))

app.get('{*splat}', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})
