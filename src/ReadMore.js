import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

const ReadMore = memo(props => {
  const [textHeight, setTextHeight] = useState(0);
  const [hiddenTextHeight, setHiddenTextHeight] = useState(0);
  const [seeMore, setSeeMore] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const onTextLayout = useCallback(({ nativeEvent: { layout: { height } } }) => {
    setTextHeight(height);
  }, [setTextHeight]);

  const onHiddenTextLayout = useCallback(({ nativeEvent: { layout: { height } } }) => {
    setHiddenTextHeight(height);
  }, [setHiddenTextHeight]);

  const toggle = useCallback(() => {
    setCollapsed(prev => !prev);
  }, [setCollapsed]);

  useEffect(() => {
    if (!hiddenTextHeight || !textHeight) return;

    setSeeMore(hiddenTextHeight > textHeight);
  }, [textHeight, hiddenTextHeight])

  const textProps = collapsed ? {
    onLayout: onTextLayout,
    numberOfLines: props.numberOfLines,
    ellipsizeMode: 'tail'
  } : {};

  return (
    <View style={styles.container}>
      <Text
        style={StyleSheet.flatten([
          Array.isArray(props.style) ? StyleSheet.flatten(props.style) : props.style,
          styles.hiddenText,
        ])}
        numberOfLines={props.numberOfLines + 1}
        ellipsizeMode={'clip'}
        onLayout={onHiddenTextLayout}
      >
        {props.children || ''}
      </Text>
      <Text
        style={props.style}
        {...textProps}
      >
        {props.children || ''}
      </Text>
      {seeMore && collapsed && (
        <View style={styles.seeMoreContainer}>
          <TouchableOpacity onPress={toggle} style={styles.seeMoreButton}>
            <Text style={props.seeMoreStyle}>
              {props.seeMoreText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {seeMore && !collapsed && (
        <TouchableOpacity onPress={toggle} style={styles.seeLessContainer}>
          <Text style={props.seeLessStyle}>
            {props.seeLessText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  hiddenText: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    color: 'transparent',
  },
  seeMoreContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  seeMoreButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  seeLessContainer: {
    paddingVertical: 4,
  },
  defaultText: {},
  seeMoreText: {
    color: 'red',
    fontWeight: 'bold',
    paddingLeft: 4,
  },
  seeLessText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

ReadMore.propTypes = {
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  seeMoreStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  seeLessStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  children: PropTypes.any,
  numberOfLines: PropTypes.number,
  seeMoreText: PropTypes.string,
  seeLessText: PropTypes.string,
};

ReadMore.defaultProps = {
  style: styles.defaultText,
  seeMoreStyle: StyleSheet.flatten([
    styles.defaultText,
    styles.seeMoreText,
  ]),
  seeLessStyle: StyleSheet.flatten([
    styles.defaultText,
    styles.seeLessText,
  ]),
  text: '',
  numberOfLines: 3,
  seeMoreText: '... See more',
  seeLessText: 'See less',
};

export default ReadMore;
