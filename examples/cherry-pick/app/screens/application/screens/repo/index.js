import './repo.css'
import 'suitcss-utils-layout'
import React from 'react'

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    org: React.PropTypes.string,
    repo: React.PropTypes.string,
    children: React.PropTypes.any
  },

  render: function () {
    return (
      <div>
        <div className='RepoHeader u-cf'>
          <ul className='RepoHeader-nav u-cf'>
            <li className='RepoHeader-navItem u-floatLeft'>
              {this.props.org} / {this.props.repo}
            </li>
            <li className='RepoHeader-navItem u-floatLeft'>
              <a href={this.context.router.generate('repo.code')}>Code</a>
            </li>
            <li className='RepoHeader-navItem u-floatLeft'>
              <a href={this.context.router.generate('repo.commits')}>Commits</a>
            </li>
          </ul>
        </div>
        <div>{this.props.children}</div>
      </div>
    )
  }
})
