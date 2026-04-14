import { bugService } from "../services/bug.service.local.js"

const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
    const [labels, setLabels] = useState([])

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    useEffect(() => {
        bugService.getLabels()
            .then(labels => setLabels(labels))
            .catch(err => console.log('Err:', err))
    }, [])

    function handleChange({ target }) {
        const field = target.name
    let value = target.value

    if (target.type === 'number' || target.type === 'range') {
        value = +value
    } else if (target.type === 'checkbox') {
        if (labels.includes(field)) {
            const currentLabels = filterByToEdit.labels || []
            value = target.checked 
                ? [...currentLabels, field]
                : currentLabels.filter(l => l !== field)
            
            setFilterByToEdit(prev => ({ ...prev, labels: value }))
            return
        }
        value = target.checked
    }

    setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
}

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity } = filterByToEdit
    return (
        <form className="bug-filter" onSubmit={onSubmitFilter}>
            <p>Filter</p>

            <label htmlFor="txt">Text: </label>
            <input value={txt} onChange={handleChange} type="text" placeholder="Search title / desc." id="txt" name="txt" />

            <label htmlFor="minSeverity">Min Severity: </label>
            <input value={minSeverity || ''} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

            <label htmlFor="label">Label: </label>
            {labels.map(label =>
                <label key={label} className="tag">
                    <input
                        onChange={handleChange}
                        name={label}
                        type="checkbox" />
                    <span>{label}</span>
                </label>)}
        </form>

    )
}