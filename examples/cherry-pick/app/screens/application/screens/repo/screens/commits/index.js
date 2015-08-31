import './commits.css'
import React from 'react'
import R from 'ramda'
import * as github from 'github'

export default React.createClass({
  statics: {
    fetchData: function (params) {
      return {
        commits: github.commits(params.org + '/' + params.repo)
      }
    }
  },

  propTypes: {
    commits: React.PropTypes.array
  },

  render () {
    return (
      <ul className='Commits'>
        {this.commits()(this.props.commits || [])}
      </ul>
    )
  },

  commits () {
    return R.map((commit) =>
      <li className='Commits-commit' key={commit.sha}>{commit.commit.message}</li>
    )
  }
})
