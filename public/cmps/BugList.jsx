const {Link} = ReactRouterDOM

import {userService} from '../services/user.service.js'
import {BugPreview} from './BugPreview.jsx'

export function BugList({bugs, onRemoveBug, onEditBug}) {
  const user = userService.getLoggedinUser()

  function isAllowed(bug) {
    return user && (user._id === bug.owner._id || user.isAdmin)
  }

  if (!bugs) return <div>Loading...</div>
  return (
    <ul className="bug-list">
      {bugs.map((bug) => (
        <li className="bug-preview" key={bug._id}>
          <BugPreview bug={bug} />
          {isAllowed(bug) && (
            <div className="actions">
              <button onClick={() => onRemoveBug(bug._id)}>x</button>
              <button onClick={() => onEditBug(bug)}>Edit</button>
            </div>
          )}
          <Link to={`/bug/${bug._id}`}>Details</Link>
        </li>
      ))}
    </ul>
  )
}
