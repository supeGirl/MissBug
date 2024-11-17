const {useEffect, useState} = React
import {LabelSelector} from './LabelSelector.jsx'
import {BugSort} from '../cmps/BugSort.jsx'

export function BugFilter({filterBy, onSetFilterBy}) {
  const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
  const [sortBy, setSortBy] = useState({type: '', desc: 1})

  const labels = ['critical', 'need-CR', 'dev-branch', 'famous', 'high']

  useEffect(() => {
    onSetFilterBy({...filterByToEdit, sortBy})
  }, [filterByToEdit, sortBy])

  function handleChange({target}) {
    console.log(target)

    const field = target.name
    const value = target.type === 'number' ? +target.value : target.value
    setFilterByToEdit((prevFilter) => ({
      ...prevFilter,
      [field]: value,
    }))
  }

  function onLabelChange(selectedLabels) {
    console.log('selectedLabels:', selectedLabels)

    setFilterByToEdit((prevFilter) => ({
      ...prevFilter,
      labels: selectedLabels,
    }))
  }

  function onSetSort(sortBy) {
    setSortBy((prevSort) => ({...prevSort, ...sortBy}))
  }

  const {severity, txt} = filterBy

  return (
    <fieldset  className="filter-container">
      <legend>Filter</legend>
      <form className="bug-filter">
        <input
          className="filter-input"
          type="text"
          id="txt"
          name="txt"
          value={txt}
          placeholder="Enter text here..."
          onChange={handleChange}
        />

        <label htmlFor="severity">By severity</label>
        <input
          placeholder="Enter severity here.."
          className="filter-input"
          type="text"
          id="severity"
          name="severity"
          value={severity}
          onChange={handleChange}
        />

        <BugSort onSetSort={onSetSort} sortBy={sortBy} />
        <LabelSelector labels={labels} onLabelChange={onLabelChange} />
      </form>
    </fieldset>
  )
}
