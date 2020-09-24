import React, {
  memo,
  useState,
  useEffect,
  useCallback,
  Component,
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const ReadMore = memo(
  ({
    numberOfLines,
    style,
    wrapperStyle,
    children,
    seeMoreStyle,
    seeMoreText,
    seeLessStyle,
    seeLessText,
    animate,
    backgroundColor,
    customTextComponent: TextComponent,
    ...restProps
  }) => {
    const [textHeight, setTextHeight] = useState(0);
    const [hiddenTextHeight, setHiddenTextHeight] = useState(0);
    const [seeMore, setSeeMore] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [afterCollapsed, setAfterCollapsed] = useState(true);

    const onTextLayout = useCallback(
      ({
        nativeEvent: {
          layout: {height},
        },
      }) => {
        setTextHeight(height);
      },
      [setTextHeight],
    );

    const onHiddenTextLayout = useCallback(
      ({
        nativeEvent: {
          layout: {height},
        },
      }) => {
        setHiddenTextHeight(height);
      },
      [setHiddenTextHeight],
    );

    const toggle = useCallback(() => {
      setCollapsed((prev) => !prev);
      if (animate) {
        LayoutAnimation.configureNext(
          LayoutAnimation.create(
            300,
            LayoutAnimation.Types.linear,
            LayoutAnimation.Properties.opacity,
          ),
        );
      }
    }, [setCollapsed, animate]);

    useEffect(() => {
      if (!hiddenTextHeight || !textHeight) {
        return;
      }

      setSeeMore(hiddenTextHeight > textHeight);
    }, [textHeight, hiddenTextHeight]);

    useEffect(() => {
      setAfterCollapsed(collapsed);
    }, [collapsed]);

    const textProps = collapsed
      ? {
          onLayout: onTextLayout,
          numberOfLines,
          ellipsizeMode: 'tail',
        }
      : {};

    return (
      <View style={wrapperStyle}>
        <TextComponent
          style={StyleSheet.flatten([
            Array.isArray(style) ? StyleSheet.flatten(style) : style,
            styles.hiddenText,
          ])}
          numberOfLines={numberOfLines + 1}
          ellipsizeMode={'clip'}
          onLayout={onHiddenTextLayout}>
          {children || ''}
        </TextComponent>
        <TextComponent {...restProps} style={style} {...textProps}>
          {children || ''}
        </TextComponent>
        {seeMore && collapsed && afterCollapsed && (
          <View style={styles.seeMoreContainer}>
            <TouchableOpacity
              onPress={toggle}
              style={[styles.seeMoreButton, {backgroundColor}]}>
              <TextComponent {...restProps} style={style}>
                {'... '}
              </TextComponent>
              <Text style={seeMoreStyle}>{seeMoreText}</Text>
            </TouchableOpacity>
          </View>
        )}
        {seeMore && !collapsed && (
          <TouchableOpacity onPress={toggle} style={styles.seeLessContainer}>
            <Text style={seeLessStyle}>{seeLessText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

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
  },
  seeLessContainer: {
    paddingVertical: 4,
  },
  defaultText: {},
  seeMoreText: {
    color: 'red',
    fontWeight: 'bold',
  },
  seeLessText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

ReadMore.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  seeMoreStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  seeLessStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  wrapperStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.any,
  numberOfLines: PropTypes.number,
  seeMoreText: PropTypes.string,
  seeLessText: PropTypes.string,
  animate: PropTypes.bool,
  backgroundColor: PropTypes.string,
  customTextComponent: PropTypes.oneOfType([
    Component,
    PureComponent,
    memo,
    PropTypes.func,
    Text,
  ]),
};

ReadMore.defaultProps = {
  style: styles.defaultText,
  seeMoreStyle: StyleSheet.flatten([styles.defaultText, styles.seeMoreText]),
  seeLessStyle: StyleSheet.flatten([styles.defaultText, styles.seeLessText]),
  wrapperStyle: styles.container,
  text: '',
  numberOfLines: 3,
  seeMoreText: 'See more',
  seeLessText: 'See less',
  animate: true,
  backgroundColor: 'white',
  customTextComponent: Text,
};

export default ReadMore;
