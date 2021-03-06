import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Header extends Component {
  renderContent() {
    switch (this.props.auth) {
      case null:
        return;
      case false:
        return (
          <li style={{ fontWeight: '300' }}>
            <a href={'/auth/google'}>Login</a>
          </li>
        );
      default:
        return [
          <li key='3' style={{ margin: '0 10px', fontWeight: '300' }}>
            <Link to='/blogs'>My Blogs</Link>
          </li>,
          <li key='2' style={{ fontWeight: '300' }}>
            <a href={'/auth/logout'}>Logout</a>
          </li>,
        ];
    }
  }

  render() {
    return (
      <nav className='grey darken-4'>
        <div className='nav-wrapper'>
          <Link
            to={this.props.auth ? '/blogs' : '/'}
            className='left brand-logo'
            style={{ marginLeft: '1rem', fontWeight: '300' }}
          >
            Bloggster
          </Link>
          <ul className='right' style={{ marginRight: '1rem' }}>{this.renderContent()}</ul>
        </div>
      </nav>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps)(Header);
