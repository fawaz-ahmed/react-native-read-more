import React from 'react';

const getStringChild = (child, preserveLinebreaks = false) => {
  const content = preserveLinebreaks ? child : child?.split('\n').join(' ');
  return {
    type: 'string',
    content,
    child: content,
  };
};

const getTextChild = (child, preserveLinebreaks = false) => {
  const content = preserveLinebreaks
    ? child.props.children
    : child.props.children?.split('\n').join(' ');
  return {
    type: child?.type?.displayName,
    content,
    child: React.cloneElement(child, child.props, content),
  };
};

export const getText = (children, TextComponent, preserveLinebreaks) => {
  if (typeof children === 'string') {
    return [getStringChild(children, preserveLinebreaks)];
  }

  if (Array.isArray(children)) {
    return children
      .filter((_child) => {
        return (
          typeof _child === 'string' ||
          _child?.type?.displayName === TextComponent?.displayName
        );
      })
      .map((_child) => {
        if (typeof _child === 'string') {
          return getStringChild(_child, preserveLinebreaks);
        }

        return getTextChild(_child);
      });
  }

  return null;
};

export const childrenToText = (children, TextComponent, preserveLinebreaks) => {
  const _textChildren = getText(children, TextComponent, preserveLinebreaks);
  return _textChildren.map((_t) => _t.content).join(' ');
};

export const childrenToTextChildren = (
  children,
  TextComponent,
  preserveLinebreaks,
) => {
  const _textChildren = getText(children, TextComponent, preserveLinebreaks);
  return _textChildren.map((_t) => _t.child);
};

export const childrenObjectsToChildren = (childrenObjects) => {
  return childrenObjects.map((_t) => _t.child);
};

export const linesToCharacters = (lines) => {
  return lines.map((_line) => _line?.text || '').join('');
};

export const insertAt = (str, sub, pos) =>
  `${str.slice(0, pos)}${sub}${str.slice(pos)}`;
