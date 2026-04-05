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

app.get('/test', (req, res) => {
    res.send("The server is definitely working!")
})

app.listen(3030, () => console.log('Server ready at port http://127.0.0.1:3030'))
