import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchBlog } from '../../actions';

class BlogShow extends Component {
  componentDidMount() {
    this.props.fetchBlog(this.props.match.params._id);
  }

  renderImage() {
    if (this.props.blog.imageUrl) {
      return (
        <img
          src={
            'https://bloggster-dev.s3.eu-west-2.amazonaws.com/' +
            this.props.blog.imageUrl
          }
          alt='blog'
        />
      );
    }
  }

  render() {
    if (!this.props.blog) {
      return '';
    }

    const { title, content } = this.props.blog;

    return (
      <div className='card' style={{ paddingBottom: '2rem' }}>
        <div className='card-image'>{this.renderImage()}</div>
        <h4 class='card-title' style={{ margin: '1rem', paddingTop: '1rem' }}>
          {title}
        </h4>
        <div class='card-content'>
          <p style={{ fontSize: '20px', margin: '2rem' }}>{content}</p>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ blogs }, ownProps) {
  return { blog: blogs[ownProps.match.params._id] };
}

export default connect(mapStateToProps, { fetchBlog })(BlogShow);
