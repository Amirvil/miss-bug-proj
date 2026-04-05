import express from 'express'
const app = express()

const bugs = [
    {
        title: "Infinite Loop Detected",
        severity: 4,
        _id: "1NF1N1T3"
    },
    {
        title: "Keyboard Not Found",
        severity: 3,
        _id: "K3YB0RD"
    },
    {
        title: "404 Coffee Not Found",
        severity: 2,
        _id: "C0FF33"
    },
    {
        title: "Unexpected Response",
        severity: 1,
        _id: "G0053"
    }
]




app.get('/api/bug', (req, res) => {
    res.send(bugs)
})

app.get('/api/bug/save', (req, res) => { })

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
