import React from 'react';

const getStringChild = child => {
  return {
    type: 'string',
    content: child,
    child,
  };
};

const getTextChild = child => {
  return {
    type: child?.type?.displayName,
    content: child.props.children,
    child: React.cloneElement(child, child.props, child.props.children),
  };
};

export const getTextByChildren = (children, TextComponent) => {
  if (typeof children === 'string') {
    return [getStringChild(children)];
  }

  if (typeof children === 'object' && children.props?.children) {
    return getTextByChildren(React.Children.toArray(children.props.children));
  }

  if (Array.isArray(children)) {
    return children
      .filter(_child => {
        return (
          typeof _child === 'string' ||
          _child?.type?.displayName === TextComponent?.displayName
        );
      })
      .map(_child => {
        if (typeof _child === 'string') {
          return getStringChild(_child);
        }
        return getTextChild(_child);
      });
  }

  return null;
};

export const linesToCharacters = lines => {
  return lines.map(_line => _line?.text || '').join('');
};

export const insertAt = (str, sub, pos) =>
  `${str.slice(0, pos)}${sub}${str.slice(pos)}`;
