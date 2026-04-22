const { useState, useEffect } = React
import { userService } from '../services/user.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function UserIndex() {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadUsers()
    }, [])

    function loadUsers() {
        userService.query()
            .then(users => {
                setUsers(users)
                setIsLoading(false)
            })
            .catch(err => {
                showErrorMsg('Only admins can view this page')
                setIsLoading(false)
            })
    }

    function onRemoveUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return

        userService.remove(userId)
            .then(() => {
                setUsers(prevUsers => prevUsers.filter(u => u._id !== userId))
                showSuccessMsg('User deleted successfully')
            })
            .catch(err => showErrorMsg('Cannot delete user'))
    }

    if (isLoading) return <div>Loading users...</div>
    if (!users.length) return <div>No users found or Access Denied.</div>

    return (
        <section className="user-index">
            <h1>Admin Panel - User Management</h1>
            <ul className="user-list">
                {users.map(user => (
                    <li key={user._id} className="user-card">
                        <div className="info">
                            <p>Name: {user.fullname}</p>
                            <p>Username: {user.username}</p>
                            <p>Role: {user.isAdmin ? 'Admin' : 'User'}</p>
                        </div>
                        <button 
                            className="btn-remove" 
                            disabled={user.isAdmin}
                            onClick={() => onRemoveUser(user._id)}
                        >
                            Delete User
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    )
}