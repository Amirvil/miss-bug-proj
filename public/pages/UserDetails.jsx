
const { useState, useEffect } = React
const { useParams, useNavigate } = ReactRouterDOM

import { userService } from "../services/user.service.js"
import { bugService } from "../services/bug.service.js"
import { BugList } from '../cmps/BugList.jsx'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function UserDetails() {

    const [user, setUser] = useState(null)
    const { userId } = useParams()
    const navigate = useNavigate()
    const [userBugs, setUserBugs] = useState([])

    useEffect(() => {
        loadUser()
        loadUserBugs()
    }, [userId])

    function loadUser() {
        userService.getById(userId)
            .then(setUser)
            .catch(err => {
                console.log('err:', err)
                navigate('/')
            })
    }

    function loadUserBugs() {
        bugService.query({ creatorId: userId })
            .then(setUserBugs)
            .catch(err => console.log('Cannot load user bugs:', err))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                setUserBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId))
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const description = prompt('Enter description:', bug.description)
        if (!severity || !description || (severity === bug.severity && description === bug.description)) return

        const bugToSave = { ...bug, severity, description }

        bugService.save(bugToSave)
            .then(savedBug => {
                setUserBugs(prevBugs => prevBugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug))
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onBack() {
        navigate('/')
    }

    if (!user) return <div>Loading...</div>

    return <section className="user-details">
        <h1>User {user.fullname}</h1>
        <pre>
            {JSON.stringify(user, null, 2)}
        </pre>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Enim rem accusantium, itaque ut voluptates quo? Vitae animi maiores nisi, assumenda molestias odit provident quaerat accusamus, reprehenderit impedit, possimus est ad?</p>

        <section className="user-bugs">
            <h2>Bugs Created by {user.fullname}</h2>
            {userBugs.length > 0 ? (
                <BugList
                    bugs={userBugs}
                    onRemoveBug={onRemoveBug}
                    onEditBug={onEditBug}
                />
            ) : (
                <p>This user hasn't created any bugs yet.</p>
            )}
        </section>

        <button onClick={onBack} >Back</button>
    </section>
}