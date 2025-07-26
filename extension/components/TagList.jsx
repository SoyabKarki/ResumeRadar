import React from 'react';
import { tagStyle } from '../styles/styles';

const TagList = ({ tags }) => (
    <div style={{ marginBottom: '6px' }}>
      {tags.map((tag, i) => (
        <span key={i} style={tagStyle(tag)}>
          {tag.text}
        </span>
      ))}
    </div>
);
  
export default TagList;
