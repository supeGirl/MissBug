import fs from 'fs'
import {utilService} from './util.service.js'
import {loggerService} from './logger.service.js'

const PAGE_SIZE = 6
const bugs = utilService.readJsonFile('data/bug.json')

export const bugService = {
  query,
  getById,
  remove,
  save,
}

function query(filterBy = {txt: '', severity: 0, userId: ''}, sortBy = {type: '', desc: 1}) {
  let filteredBugs = bugs

  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, 'i')
    filteredBugs = filteredBugs.filter((bug) => regExp.test(bug.title))
  }

  if (filterBy.severity) {
    filteredBugs = filteredBugs.filter((bug) => bug.severity >= filterBy.severity)
  }

  if (filterBy.label) {
    filteredBugs = filteredBugs.filter((bug) => bug.labels.includes(filterBy.label))
  }

  if (sortBy.type === 'createdAt') {
    filteredBugs.sort((b1, b2) => +sortBy.desc * (b2.createdAt - b1.createdAt))
  } else if (sortBy.type === 'severity') {
    filteredBugs.sort((b1, b2) => +sortBy.desc * (b1.severity - b2.severity))
  } else if (sortBy.type === 'title') {
    filteredBugs.sort((b1, b2) => +sortBy.desc * b1.title.localeCompare(b2.title))
  }

  if (filterBy.userId) {
    filteredBugs = filteredBugs.filter((bug) => bug.owner._id === filterBy.userId)
  }

  if (filterBy.pageIdx !== undefined) {
    const startIdx = filterBy.pageIdx * PAGE_SIZE
    filteredBugs = filteredBugs.slice(startIdx, startIdx + PAGE_SIZE)
    // loggerService.info(filterBy)
  }

  return Promise.resolve(filteredBugs)
}

function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId)
  if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
  return Promise.resolve(bug)
}

function remove(bugId, user) {
  const idx = bugs.findIndex((bug) => bug._id === bugId)
  if (idx === -1) return Promise.reject('No bug found')

  if (bugs[idx].owner._id !== user._id && !user.isAdmin) {
    return Promise.reject('Not authorized delete this bug')
  }

  bugs.splice(idx, 1)
  return _saveBugsToFile()
}

function save(bugToSave, user) {
  if (bugToSave._id) {
    const idx = bugs.findIndex((currBug) => currBug._id === bug._id)
    if (idx === -1) return Promise.reject('No such bug')

    if (bugs[idx].owner._id !== user._id && !user.isAdmin) {
      return Promise.reject('Not authorized update this bug')
    }

    bugToSave = {
      title: bugToSave.title,
      severity: bugToSave.severity,
      label: bugToSave.label,
      updatedAt: Date.now(),
    }

    bugs[idx].title = bugToSave.title
    bugs[idx].severity = bugToSave.severity
    bugs[idx].label = bugToSave.label
    bugs[idx].updatedAt = bugToSave.updatedAt

    bugToSave = bugs[idx]
  } else {
    bugToSave = {
      _id: 'bug' + utilService.makeId(),
      title: bugToSave.title || '',
      severity: +bugToSave.severity || 0,
      label: bugToSave.label || ['critical', 'need-CR'],
      createdAt: Date.now(),
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, earum sed corrupti voluptatum voluptatem at.',
      owner: user,
    }
    bugs.push(bugToSave)
  }

  return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bugs, null, 4)
    fs.writeFile('data/bug.json', data, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function _setNextPrevBugId(bug) {
  const bugIdx = bugs.findIndex((currBug) => currBug._id === bug._id)
  const nextBug = bugs[bugIdx + 1] ? bugs[bugIdx + 1] : bugs[0]
  const prevBug = bugs[bugIdx - 1] ? bugs[bugIdx - 1] : bugs[bugs.length - 1]
  bug.nextBugId = nextBug._id
  bug.prevBugId = prevBug._id
  return bug
}
