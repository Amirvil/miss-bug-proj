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

    function onChangePage(diff) {
        const nextPage = Math.max(0, (filterByToEdit.pageIdx || 0) + diff)
        onSetFilterBy({ ...filterByToEdit, pageIdx: nextPage })
    }

    const { txt, minSeverity, sortBy, sortDir } = filterByToEdit
    return (
        <section className="bug-filter">
            <form onSubmit={onSubmitFilter}>
                <div className="filter-group">
                    <h3 className="filter-title">Filter: </h3>
                    <div className="filter-txt">
                        <label htmlFor="txt">Search:</label>
                        <input value={txt} onChange={handleChange} type="text" name="txt" placeholder="Search bugs..." id="txt" />
                    </div>

                    <div className="filter-severity">
                        <label htmlFor="minSeverity">Severity:</label>
                        <input value={minSeverity || ''} onChange={handleChange} type="number" name="minSeverity" id="minSeverity" />
                    </div>
                </div>

                <div className="labels-group">
                    <h3 className="labels-title">Lables: </h3>
                    <div className="labels-container">
                        {labels.map(label => (
                            <label key={label} className="tag-checkbox">
                                <input
                                    onChange={handleChange}
                                    name={label}
                                    type="checkbox"
                                    checked={(filterByToEdit.labels && filterByToEdit.labels.includes(label)) || false}></input>
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="sort-group">
                    <h3 htmlFor="sortBy">Sort by: </h3>
                    <select name="sortBy" id="sortBy" value={sortBy} onChange={handleChange}>
                        <option value="title">Title</option>
                        <option value="severity">Severity</option>
                        <option value="createdAt">Date</option>
                    </select>
                    <label className="checkbox-ui">
                        <input
                            type="checkbox"
                            name="sortDir"
                            checked={sortDir === -1}
                            onChange={(ev) => {
                                const value = ev.target.checked ? -1 : 1
                                setFilterByToEdit(prev => ({ ...prev, sortDir: value }))
                            }}
                        />
                        <span>Descending</span>
                    </label>
                </div>
            </form>
            <section className="pagination">
                <button onClick={() => onChangePage(-1)}>Prev</button>
                <span>{filterBy.pageIdx + 1}</span>
                <button onClick={() => onChangePage(1)}>Next</button>
            </section>
        </section>
    )
}