import {bugService} from '../services/bug.service.js'
import {showSuccessMsg, showErrorMsg} from '../services/event-bus.service.js'
import {BugList} from '../cmps/BugList.jsx'
import {BugFilter} from '../cmps/BugFilter.jsx'

const {useState, useEffect} = React
const {Link} = ReactRouterDOM

export function BugIndex() {

  const [bugs, setBugs] = useState([])
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

  useEffect(() => {
    loadBugs()
  }, [filterBy])

  function loadBugs() {
    bugService
      .query(filterBy)
      .then((bugs) => {
        setBugs(bugs)
      })
      .catch((err) => {
        showErrorMsg('Cannot load bugs')
        console.error('Error from load bugs ->', err)
      })
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        console.log('Deleted Succesfully!')
        setBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId))
        showSuccessMsg('Bug removed')
      })
      .catch(err => {
        console.log('from remove bug', err)
        showErrorMsg('Cannot remove bug')
      })
  }

  function onAddBug() {
    const bug = {
      title: prompt('Bug title?'),
      severity: +prompt('Bug severity?'),
    }
    bugService
      .save(bug)
      .then((savedBug) => {
        console.log('Added Bug', savedBug)
        setBugs([...bugs, savedBug])
        showSuccessMsg('Bug added')
      })
      .catch((err) => {
        console.log('Error from onAddBug ->', err)
        showErrorMsg('Cannot add bug')
      })
  }

  function onEditBug(bug) {
    const severity = +prompt('New severity?')
    const bugToSave = {...bug, severity}
    bugService
      .save(bugToSave)
      .then((savedBug) => {
        console.log('Updated Bug:', savedBug)
        const bugsToUpdate = bugs.map((currBug) => (currBug._id === savedBug._id ? savedBug : currBug))
        setBugs(bugsToUpdate)
        showSuccessMsg('Bug updated')
      })
      .catch((err) => {
        console.log('Error from onEditBug ->', err)
        showErrorMsg('Cannot update bug')
      })
  }

  function onSetFilterBy(newFilterBy) {
    setFilterBy((prevFilterBy) => ({...prevFilterBy, ...newFilterBy}))
  }



  function onChangePageIdx(diff) {
    setFilterBy((prevFilter) => ({...prevFilter, pageIdx: prevFilter.pageIdx + diff}))
  }

  function onDownloadPdf() {
    window.open('/pdf', '_blank')
  }

  return (
    <main>
      <section className="info-actions">
        <h3>Bugs App</h3>
        <BugFilter filterBy={{...filterBy}} onSetFilterBy={onSetFilterBy} />

        <div className="action container">
          <button
            onClick={() => {
              onChangePageIdx(1)
            }}
          >
            +
          </button>
          page {filterBy.pageIdx + 1 || ''}
          <button
            onClick={() => {
              onChangePageIdx(-1)
            }}
            disabled={filterBy.pageIdx === 0}
          >
            -
          </button>
        </div>

        <button onClick={onAddBug}>Add Bug ⛐</button>
        <button onClick={onDownloadPdf}>Download PDF</button>
      </section>
      <main>
        <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
      </main>
    </main>
  )
}
