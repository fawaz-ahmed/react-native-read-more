import React, {memo, useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  childrenToTextChildren,
  getText,
  insertAt,
  linesToCharacters,
  childrenObjectsToChildren,
} from './helper';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const readmoreAnimation = LayoutAnimation.create(
  300,
  LayoutAnimation.Types.easeOut,
  LayoutAnimation.Properties.opacity,
);

const ReadMore = ({
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
  ellipsis,
  allowFontScaling,
  onExpand,
  onCollapse,
  expandOnly,
  seeMoreOverlapCount,
  debounceSeeMoreCalc,
  preserveLinebreaks,
  ...restProps
}) => {
  const [additionalProps, setAdditionalProps] = useState({});
  // hiddenTextHeightOne comes from hidden component one
  const [hiddenTextHeightOne, setHiddenTextHeightOne] = useState(0);
  // hiddenTextHeightWithSeeLess comes from hidden component two
  const [
    hiddenTextHeightWithSeeLess,
    setHiddenTextHeightWithSeeLess,
  ] = useState(0);
  // textHeight and textWidth comes from hidden component three
  const [textHeight, setTextHeight] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  // lineOfImpact comes from hidden component four
  const [lineOfImpact, setLineOfImpact] = useState({});
  const [lines, setLines] = useState([]);
  const [truncatedLineOfImpact, setTruncatedLineOfImpact] = useState('');
  const [truncatedLineOfImpactWidth, setTruncatedLineOfImpactWidth] = useState(
    0,
  );
  const [seeMoreRightPadding, setSeeMoreRightPadding] = useState(0);
  // mount or unmount hidden components
  const [mountHiddenTextOne, setMountHiddenTextOne] = useState(true);
  const [mountHiddenTextTwo, setMountHiddenTextTwo] = useState(true);
  const [mountHiddenTextThree, setMountHiddenTextThree] = useState(true);
  const [mountHiddenTextFour, setMountHiddenTextFour] = useState(true);
  const [mountHiddenTextFive, setMountHiddenTextFive] = useState(false);
  // initial measurement is in progress
  const [isMeasuring, setIsMeasuring] = useState(true);
  // logic decisioning params
  const [seeMore, setSeeMore] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [afterCollapsed, setAfterCollapsed] = useState(true);
  // copy of children with only text
  const [collapsedChildren, setCollapsedChildren] = useState(
    childrenToTextChildren(children, TextComponent, preserveLinebreaks),
  );
  const [measuredCollapsedChildren, setMeasuredCollapsedChildren] = useState(
    null,
  );
  // width of see more component
  const [seeMoreWidth, setSeeMoreWidth] = useState(0);

  const onSeeMoreViewLayout = useCallback(
    ({
      nativeEvent: {
        layout: {width},
      },
    }) => {
      setSeeMoreWidth(width);
    },
    [setSeeMoreWidth],
  );

  const onLayoutHiddenTextFive = useCallback(
    ({
      nativeEvent: {
        layout: {width},
      },
    }) => {
      setMountHiddenTextFive(false);
      setTruncatedLineOfImpactWidth(width);
    },
    [setTruncatedLineOfImpactWidth, setMountHiddenTextFive],
  );

  const onTextLayoutHiddenTextFour = useCallback(
    ({nativeEvent: {lines: _lines}}) => {
      const _lineOfImpact = _lines[numberOfLines - 1];
      setLineOfImpact(_lineOfImpact);
      setLines(_lines);
    },
    [numberOfLines, setLineOfImpact, setLines],
  );

  const onLayoutHiddenTextFour = useCallback(() => {
    setMountHiddenTextFour(false);
  }, [setMountHiddenTextFour]);

  const onLayoutHiddenTextThree = useCallback(
    ({
      nativeEvent: {
        layout: {height, width},
      },
    }) => {
      setTextHeight(height);
      setTextWidth(width);
      setMountHiddenTextThree(false);
    },
    [setTextHeight, setTextWidth, setMountHiddenTextThree],
  );

  const onHiddenTextLayoutOne = useCallback(
    ({
      nativeEvent: {
        layout: {height},
      },
    }) => {
      setHiddenTextHeightOne(height);
      setMountHiddenTextOne(false);
    },
    [setHiddenTextHeightOne, setMountHiddenTextOne],
  );

  const onHiddenSeeLessTextLayoutTwo = useCallback(
    ({
      nativeEvent: {
        layout: {height},
      },
    }) => {
      setHiddenTextHeightWithSeeLess(height);
      setMountHiddenTextTwo(false);
    },
    [setHiddenTextHeightWithSeeLess, setMountHiddenTextTwo],
  );

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  const measureSeeMoreLine = useCallback(() => {
    if (
      !seeMore ||
      !textWidth ||
      !numberOfLines ||
      !seeMoreWidth ||
      !lineOfImpact?.text
    ) {
      setTruncatedLineOfImpact('');
      setTruncatedLineOfImpactWidth(0);
      return setMeasuredCollapsedChildren(null);
    }
    // if line of impact
    // use number fo lines - 1 lines with wrap text and clip ellipsis
    // another text component with line of impact
    // width will be total width - see more width
    // show this ^^ on collapsed state
    const linesTillImpact = Array(numberOfLines)
      .fill({})
      .map((_e, index) => lines[index]);
    const charactersBeforeSeeMore = linesToCharacters(linesTillImpact);
    const charactersLengthTillSeeMore = charactersBeforeSeeMore.trim().length;
    const seeMoreTextLength =
      `${ellipsis} ${seeMoreText}`.length + seeMoreOverlapCount;
    const textBreakPosition = charactersLengthTillSeeMore - seeMoreTextLength;
    const trimmedLineOfImpact = lineOfImpact.text.trim();
    const _truncatedLineOfImpact = trimmedLineOfImpact.substring(
      0,
      trimmedLineOfImpact.length - seeMoreTextLength,
    );
    setTruncatedLineOfImpact(_truncatedLineOfImpact);

    // go to this position and insert a line break
    let charactersToTraverse = textBreakPosition;
    let nodeFound = false;
    const modifiedChildrenObjects = getText(children, TextComponent, preserveLinebreaks).map(
      (_childObject) => {
        if (nodeFound) {
          return _childObject;
        }
        if (_childObject.content.length > charactersToTraverse) {
          // this node is the one
          nodeFound = true;
          const childContent = insertAt(
            _childObject.content,
            '\n',
            charactersToTraverse,
          );
          return {
            type: _childObject?.type,
            content: childContent,
            child:
              _childObject?.type === 'string'
                ? childContent
                : React.cloneElement(
                    _childObject,
                    _childObject.props,
                    childContent,
                  ),
          };
        }
        charactersToTraverse =
          charactersToTraverse - _childObject.content.length;

        return _childObject;
      },
    );

    if (nodeFound) {
      return setMeasuredCollapsedChildren(
        childrenObjectsToChildren(modifiedChildrenObjects),
      );
    }

    return setMeasuredCollapsedChildren(null);
  }, [
    children,
    TextComponent,
    textWidth,
    numberOfLines,
    seeMore,
    seeMoreWidth,
    lineOfImpact,
    lines,
    ellipsis,
    seeMoreText,
    seeMoreOverlapCount,
  ]);

  const textProps = afterCollapsed
    ? {
        numberOfLines,
        ellipsizeMode: 'clip',
      }
    : {};

  const commonHiddenComponentProps = {
    ...additionalProps,
    style: StyleSheet.flatten([
      Array.isArray(style) ? StyleSheet.flatten(style) : style,
      styles.hiddenTextAbsolute,
    ]),
  };

  const hiddenComponentPropsLineOfImpact = {
    ...additionalProps,
    style: StyleSheet.flatten([
      Array.isArray(style) ? StyleSheet.flatten(style) : style,
      styles.hiddenTextAbsoluteCompact,
    ]),
  };

  const seeMoreBackgroundStyle =
    isMeasuring || lineOfImpact?.text ? {} : {backgroundColor};
  const seeMoreContainerStyle = [
    styles.seeMoreContainer,
    seeMoreBackgroundStyle,
    {
      marginRight: seeMoreRightPadding,
    },
  ];

  useEffect(() => {
    if (!hiddenTextHeightOne || !textHeight) {
      return;
    }

    setSeeMore(hiddenTextHeightOne > textHeight);
  }, [textHeight, hiddenTextHeightOne]);

  useEffect(() => {
    if (collapsed === afterCollapsed) {
      return;
    }

    const callback = collapsed ? onCollapse : onExpand;
    setAfterCollapsed(collapsed);
    if (animate) {
      LayoutAnimation.configureNext(readmoreAnimation, callback);
    } else {
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setMountHiddenTextOne(true);
      setMountHiddenTextTwo(true);
      setMountHiddenTextThree(true);
      setMountHiddenTextFour(true);
    }, debounceSeeMoreCalc);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // re calc if any of these params change
    numberOfLines,
    style,
    wrapperStyle,
    children,
    seeMoreStyle,
    seeMoreText,
    seeLessStyle,
    seeLessText,
    ellipsis,
    additionalProps,
  ]);

  useEffect(() => {
    const checkIfStillMeasuring = () => {
      if (
        !mountHiddenTextOne &&
        !mountHiddenTextTwo &&
        !mountHiddenTextThree &&
        !mountHiddenTextFour
      ) {
        setIsMeasuring(false);
        if (animate) {
          LayoutAnimation.configureNext(readmoreAnimation);
        }
      }
    };

    const handler = setTimeout(checkIfStillMeasuring, debounceSeeMoreCalc);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mountHiddenTextOne,
    mountHiddenTextTwo,
    mountHiddenTextThree,
    mountHiddenTextFour,
  ]);

  // a map of additional props to be passed down
  // in hidden text components other than style
  // for accurate measurements
  useEffect(() => {
    const _additionalProps = {};

    // pick selected params
    if (allowFontScaling !== undefined) {
      _additionalProps.allowFontScaling = allowFontScaling;
    }

    setAdditionalProps(_additionalProps);
  }, [allowFontScaling]);

  useEffect(() => {
    const handle = setTimeout(measureSeeMoreLine, debounceSeeMoreCalc);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measureSeeMoreLine]);

  useEffect(() => {
    const _textChildren = childrenToTextChildren(children, TextComponent, preserveLinebreaks);
    setCollapsedChildren(_textChildren);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useEffect(() => {
    if (!truncatedLineOfImpact) {
      return;
    }

    setMountHiddenTextFive(true);
  }, [truncatedLineOfImpact]);

  useEffect(() => {
    if (!truncatedLineOfImpactWidth || !seeMoreWidth || !textWidth) {
      setSeeMoreRightPadding(0);
      return;
    }
    const _seeMoreRightPadding =
      textWidth - truncatedLineOfImpactWidth - seeMoreWidth;
    if (_seeMoreRightPadding > 0) {
      setSeeMoreRightPadding(_seeMoreRightPadding);
      if (animate) {
        LayoutAnimation.configureNext(readmoreAnimation);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truncatedLineOfImpactWidth, seeMoreWidth, textWidth]);

  return (
    <View style={wrapperStyle}>
      {/* text component to measure see if see more is applicable and get height */}
      {mountHiddenTextOne && (
        <TextComponent
          {...commonHiddenComponentProps}
          ellipsizeMode={'clip'}
          onLayout={onHiddenTextLayoutOne}>
          {children || ''}
        </TextComponent>
      )}
      {/* text component to measure height with see less */}
      {mountHiddenTextTwo && (
        <TextComponent
          {...commonHiddenComponentProps}
          onLayout={onHiddenSeeLessTextLayoutTwo}>
          {children || ''}
          {/* 3 spaces before see less are intentional */}
          {`   ${seeLessText}`}
        </TextComponent>
      )}
      {/* to remove all flickers add another hidden component with collapsed children to get seeMore and all hidden components to use collapsed children only */}
      {mountHiddenTextThree && (
        <TextComponent
          {...commonHiddenComponentProps}
          numberOfLines={numberOfLines}
          onLayout={onLayoutHiddenTextThree}>
          {collapsedChildren || ''}
          {/* no see less here since it's in collapsed state replicating original component */}
        </TextComponent>
      )}
      {/* extract line of impact -> see more line */}
      {mountHiddenTextFour && (
        <TextComponent
          {...commonHiddenComponentProps}
          numberOfLines={numberOfLines + 1}
          onLayout={onLayoutHiddenTextFour}
          onTextLayout={onTextLayoutHiddenTextFour}>
          {collapsedChildren || ''}
          {/* no see less here since it's in collapsed state replicating original component */}
        </TextComponent>
      )}
      {/* extract width of line of impact without see more line */}
      {mountHiddenTextFive && (
        <TextComponent
          {...hiddenComponentPropsLineOfImpact}
          onLayout={onLayoutHiddenTextFive}>
          {truncatedLineOfImpact}
        </TextComponent>
      )}
      {/* actual text component */}
      <TextComponent
        {...additionalProps}
        {...restProps}
        style={style}
        {...textProps}>
        {isMeasuring || (seeMore && collapsed)
          ? measuredCollapsedChildren || collapsedChildren || ''
          : children || ''}
        {seeMore && !collapsed && !expandOnly && (
          <TextComponent
            {...additionalProps}
            {...restProps}
            onPress={toggle}
            style={seeLessStyle}>
            {hiddenTextHeightWithSeeLess > hiddenTextHeightOne ? '\n' : ' '}
            {seeLessText}
          </TextComponent>
        )}
      </TextComponent>
      {/* See more component */}
      {seeMore && collapsed && !!collapsedChildren && !isMeasuring && (
        <View style={seeMoreContainerStyle} onLayout={onSeeMoreViewLayout}>
          <TextComponent
            {...additionalProps}
            {...restProps}
            onPress={toggle}
            style={style}>
            {`${ellipsis}`}
          </TextComponent>
          <TextComponent
            {...additionalProps}
            {...restProps}
            onPress={toggle}
            style={[style, seeMoreStyle]}>
            {` ${seeMoreText}`}
          </TextComponent>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  hiddenTextAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    color: 'transparent',
    display: 'none',
  },
  hiddenTextAbsoluteCompact: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: 'transparent',
    display: 'none',
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
    PropTypes.node,
    PropTypes.element,
    PropTypes.elementType,
  ]),
  ellipsis: PropTypes.string,
  allowFontScaling: PropTypes.bool,
  onExpand: PropTypes.func,
  onCollapse: PropTypes.func,
  expandOnly: PropTypes.bool,
  seeMoreOverlapCount: PropTypes.number,
  debounceSeeMoreCalc: PropTypes.number,
  preserveLinebreaks: PropTypes.bool,
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
  ellipsis: '...',
  onExpand: () => {},
  onCollapse: () => {},
  expandOnly: false,
  seeMoreOverlapCount: 1,
  debounceSeeMoreCalc: 300,
  preserveLinebreaks: false,
};

export default memo(ReadMore);
