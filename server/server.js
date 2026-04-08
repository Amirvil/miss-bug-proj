import express from 'express'
import cors from 'cors'

import { bugService } from '../services/bug.service.js'

const app = express()
app.use(cors())

app.use(express.static('public'))

app.get('/api/bug', (req, res) => {
    bugService.query()
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

app.listen(3030, () => console.log('Server ready at port http://127.0.0.1:3030'))
