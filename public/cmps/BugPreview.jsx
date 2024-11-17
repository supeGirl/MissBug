

export function BugPreview({bug}) {
     const severityClass = `severity${bug.severity}`

    return <article className="bug-details">
        <h4 className="title">{bug.title}</h4>
        <h1 className="img">🐛</h1>
        <p className="severity">Severity: <span className={severityClass}>{bug.severity}</span></p>
    </article>
}