import './code.css';
import React from 'react';
import R from 'ramda';
import * as github from 'github';
let decode = window.atob;

let Breadcrumb = React.createClass({
  render() {
    var props = this.props;
    return (
      <ul className='Code-breadcrumb'>
        <li className='Code-breadcrumbPart'>
          <a href={props.link('')}>{props.repo}</a>
        </li>
        {slash()}
        {interleaveSlashes(parts(props.path, props.link))}
      </ul>
    );

    function parts(path, link) {
      var p = "";
      return path.split("/").map(function (part) {
        if (p !== "") {
          p += "/";
        }
        p += part;
        return (
          <li className='Code-breadcrumbPart' key={p}>
            <a href={link(p)}>{part}</a>
          </li>
        );
      });
    }

    function interleaveSlashes(parts) {
      return parts.reduce(function (memo, part) {
        memo.push(part);
        if (memo.length !== (parts.length * 2) - 1) {
          memo.push(slash());
        }
        return memo;
      }, []);
    }

    function slash() {
      return <li className='Code-breadcrumbPart'>{'/'}</li>;
    }
  }
});

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  statics: {
    fetchData: function (params) {
      var repoUid = params.org + '/' + params.repo;
      var path = params.splat || '';
      return {
        code: github.code(repoUid, path),
        path: path,
        repo: params.repo
      };
    }
  },
  render() {
    var code = this.props.code;
    var path = this.props.path;
    var repo = this.props.repo;

    var content;
    if (code.type && code.type === 'file') {
      content = this.renderFile(code);
    } else {
      content = this.renderTree(code);
    }

    return (
      <div className='Code'>
        <Breadcrumb repo={repo} path={path} link={this.link} />
        {content}
      </div>
    );
  },

  renderTree(list) {
    var files = R.map((item) => {
      return (
        <li className='Code-file' key={item.sha}>
          <a className='Code-fileLink' href={this.link(item.path)}>{item.name}</a>
        </li>
      );
    }, list);
    return (<ul>{files}</ul>);
  },

  renderFile(file) {
    return (<pre className='Code-fileContents'>{decode(file.content)}</pre>);
  },

  link(path) {
    return this.context.router.generate('repo.code', {
      splat: path
    });
  }
});