import axios from 'axios'

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
  getBugsByUserId,
}

const BASE_URL = '/api/bug/'

// _createBugs()

function query(filterBy) {
  return axios
    .get(BASE_URL, {params: filterBy})
    .then((res) => res.data)

    .catch((err) => {
      console.error('Error fetching bugs:', err)
      throw err
    })
}

function getById(bugId) {
  return axios.get(BASE_URL + bugId).then((res) => res.data)
}

function remove(bugId) {
  return axios.delete(BASE_URL + bugId).then((res) => res.data)
}

function save(bug) {
  const method = bug._id ? 'put' : 'post'

  return axios[method](BASE_URL + (method === 'put' ? bug._id : ''), bug).then((res) => res.data)
  // if (bug._id) {
  //   return axios.put(BASE_URL + bug._id, bug).then((res) => res.data)
  // } else {
  //   return axios.post(BASE_URL, bug).then((res) => res.data)
  // }
}

function getDefaultFilter() {
  return {txt: '', severity: '', labels: '', pageIdx: 0, sortBy: {type: 'title', desc: 1}}
}

function getBugsByUserId(userId) {
  return axios
  .get(BASE_URL)
  .then((res) => {
      const filteredBugs = res.data.filter((bug) => bug.owner._id === userId)
      return filteredBugs
    })
    .catch((err) => {
      console.error(`Error fetching bugs for user ${err}`)
      throw err
    })
}
