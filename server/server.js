import express from 'express'
import { makeId } from '../services/util.service.js'
const app = express()

const bugs = [
    {
        _id: "1NF1N1T3",
        title: "Infinite Loop Detected",
        description,
        severity: 4,
        createdAt

    },
    {
        _id: "K3YB0RD",
        title: "Keyboard Not Found",
        description,
        severity: 3,
        createdAt
    },
    {
        _id: "C0FF33",
        title: "404 Coffee Not Found",
        description,
        severity: 2,
        createdAt
    },
    {
        _id: "G0053",
        title: "Unexpected Response",
        description,
        severity: 1,
        createdAt
    }
]




app.get('/api/bug', (req, res) => {
    res.send(bugs)
})

app.get('/api/bug/save', (req, res) => {
    const { title, severity, bugId } = req.query
    const bugToSave = {
        title,
        severity: +severity,
        _id: bugId
    }

    if (bugId) {
        const idx = bugs.findIndex(bug => bug._id === bugId)
        bugs[idx] = { ...bugs[idx], ...bugToSave }
    } else {
        bugToSave._id = makeId()
        bugs.push(bugToSave)
    }

    res.send(bugToSave)
})

app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId
    const bug = bugs.find(bug => bug._id === bugId)
    res.send(bug)
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const bugId = req.params.bugId
    const idx = bugs.findIndex(bug => bug._id === bugId)
    bugs.splice(idx, 1)

    res.send('Bug Deleted')
})

app.listen(3030, () => console.log('Server ready at port http://127.0.0.1:3030'))
