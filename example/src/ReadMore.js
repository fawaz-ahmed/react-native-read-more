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
import {getText, insertAt, linesToCharacters} from './helper';

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
  customTextComponent: TextComponent,
  ellipsis,
  allowFontScaling,
  onExpand,
  onCollapse,
  expandOnly,
  seeMoreOverlapCount,
  debounceSeeMoreCalc,
  onLayout,
  onTextLayout,
  ...restProps
}) => {
  const [additionalProps, setAdditionalProps] = useState({});
  // hiddenTextLinesWithSeeLess comes from hidden component two
  const [hiddenTextLinesWithSeeLess, setHiddenTextLinesWithSeeLess] = useState(
    [],
  );
  // textHeight and textWidth comes from hidden component three
  const [textWidth, setTextWidth] = useState(0);
  // lineOfImpact comes from hidden component four
  // const [lineOfImpact, setLineOfImpact] = useState({});
  const [truncatedLineOfImpact, setTruncatedLineOfImpact] = useState('');
  const [truncatedLineOfImpactWidth, setTruncatedLineOfImpactWidth] = useState(
    0,
  );
  const [lines, setLines] = useState([]);
  const [collapsedLines, setCollapsedLines] = useState([]);
  const [seeMoreRightPadding, setSeeMoreRightPadding] = useState(0);
  // mount or unmount hidden components
  const [mountHiddenTextOne, setMountHiddenTextOne] = useState(false);
  const [mountHiddenTextTwo, setMountHiddenTextTwo] = useState(false);
  const [mountHiddenTextThree, setMountHiddenTextThree] = useState(false);
  const [mountHiddenTextSix, setMountHiddenTextSix] = useState(false);
  const [mountHiddenTextSeven, setMountHiddenTextSeven] = useState(false);
  // initial measurement is in progress
  const [isMeasured, setIsMeasured] = useState(false);
  // logic decisioning params
  const [seeMore, setSeeMore] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [afterCollapsed, setAfterCollapsed] = useState(true);
  // copy of children with only text
  const [collapsedChildren, setCollapsedChildren] = useState(null);
  const [reconciledLineOfImpact, setReconciledLineOfImpact] = useState('');
  // eslint-disable-next-line prettier/prettier
  const [reconciledLineOfImpactWidth, setReconciledLineOfImpactWidth] = useState(0);
  // width of see more component
  const [seeMoreWidth, setSeeMoreWidth] = useState(0);
  const [hideEllipsis, setHideEllipsis] = useState(false);

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

  const onTextLayoutOne = useCallback(
    ({nativeEvent: {lines: _lines}}) => {
      setLines(_lines);
      setMountHiddenTextOne(false);
      setMountHiddenTextTwo(true);
    },
    [setLines, setMountHiddenTextOne],
  );

  const onTextLayoutTwo = useCallback(
    ({nativeEvent: {lines: _lines}}) => {
      setHiddenTextLinesWithSeeLess(_lines);
      setMountHiddenTextTwo(false);
    },
    [setHiddenTextLinesWithSeeLess, setMountHiddenTextTwo],
  );

  const onLayoutActualTextComponent = useCallback(
    (event) => {
      const _event = event; // clone event
      const _width = _event?.nativeEvent?.layout?.width || 0;
      setTextWidth(_width);
      onLayout(_event);
    },
    [setTextWidth, onLayout],
  );

  const onTextLayoutActualTextComponent = useCallback(
    (event) => {
      const _event = event; // clone event
      if (collapsed) {
        const _lines = _event?.nativeEvent?.lines || [];
        setCollapsedLines(_lines);
      }
      onTextLayout(_event);
    },
    [setCollapsedLines, collapsed, onTextLayout],
  );

  const onLayoutThree = useCallback(
    ({
      nativeEvent: {
        layout: {width},
      },
    }) => {
      setTruncatedLineOfImpactWidth(width);
      setMountHiddenTextThree(false);
    },
    [setTruncatedLineOfImpactWidth, setMountHiddenTextThree],
  );

  const onLayoutHiddenTextSix = useCallback(() => {
    setMountHiddenTextSix(false);
    setMountHiddenTextSeven(true);
  }, [setMountHiddenTextSix, setMountHiddenTextSeven]);

  const onTextLayoutHiddenTextSix = useCallback(
    ({nativeEvent: {lines: _lines}}) => {
      const _lineOfImpact = _lines[numberOfLines - 1];
      setReconciledLineOfImpact(_lineOfImpact?.text || '');
    },
    [numberOfLines, setReconciledLineOfImpact],
  );

  const onLayoutHiddenTextSeven = useCallback(
    ({
      nativeEvent: {
        layout: {width},
      },
    }) => {
      setMountHiddenTextSeven(false);
      setReconciledLineOfImpactWidth(width);
    },
    [setReconciledLineOfImpactWidth, setMountHiddenTextSeven],
  );

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  const measureSeeMoreLine = useCallback(() => {
    if (
      numberOfLines < 1 ||
      !lines.length ||
      !collapsedLines.length ||
      !seeMore ||
      !seeMoreWidth
    ) {
      return;
    }

    if (!lines[numberOfLines - 1] || !collapsedLines[numberOfLines - 1]) {
      return;
    }

    // find line of impact
    let _lineOfImpact = lines[numberOfLines - 1];
    _lineOfImpact.index = numberOfLines - 1;
    if (Platform.OS === 'ios') {
      const modifiedIndex = lines.findIndex((_line, index) => {
        if (index + 1 < numberOfLines - 1) {
          return false;
        }
        return collapsedLines[numberOfLines - 1].text.includes(_line.text);
      });
      _lineOfImpact = lines[modifiedIndex];
      _lineOfImpact.index = modifiedIndex;
    }

    const availableWidth = textWidth - seeMoreWidth;

    // calculate how many characters to cut off if any
    // trim right before -> spaces and \n
    // width from line, textWidth, seeMoreWidth

    // if no text after right trim
    // hide ellipsis
    // move see more to beginning
    if (_lineOfImpact.text.trim().length === 0) {
      _lineOfImpact.width = 0;
      _lineOfImpact.text = '';
      setHideEllipsis(true);
    } else {
      setHideEllipsis(false);
    }

    // todo
    // right trim and width adjustment

    // setLineOfImpact(_lineOfImpact);

    if (_lineOfImpact.width < availableWidth) {
      // if no need to cutoff, simply calculate see more right padding
      const _seeMoreRightPadding =
        textWidth - _lineOfImpact.width - seeMoreWidth;
      if (_seeMoreRightPadding > 0) {
        setTruncatedLineOfImpact('');
        setTruncatedLineOfImpactWidth(0);
        // setReconciledLineOfImpact('');
        // setReconciledLineOfImpactWidth(0);
        setSeeMoreRightPadding(_seeMoreRightPadding);
        // todo: remove this
        if (animate) {
          LayoutAnimation.configureNext(readmoreAnimation);
        }
      }
    } else {
      // todo
      // determine point, traverse through nodes
      // create collapsed children with spaces at the point
      const seeMoreTextLength =
        `${ellipsis} ${seeMoreText}`.length + seeMoreOverlapCount;
      const linesTillImpact = Array(_lineOfImpact.index + 1)
        .fill({})
        .map((_e, index) => lines[index]);
      const charactersBeforeSeeMore = linesToCharacters(linesTillImpact);
      const charactersLengthTillSeeMore = charactersBeforeSeeMore.length;
      // text break position for collapsed text
      const textBreakPosition = charactersLengthTillSeeMore - seeMoreTextLength;

      const _truncatedText = _lineOfImpact.text.substr(
        0,
        _lineOfImpact.text.length - seeMoreTextLength,
      );

      if (truncatedLineOfImpact !== _truncatedText) {
        setTruncatedLineOfImpact(_truncatedText);
      }

      // go to this position and insert spaces
      let charactersToTraverse = textBreakPosition;
      let nodeFound = false;
      const modifiedChildrenObjects = getText(children, TextComponent, true)
        ?.map((_childObject) => {
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
        })
        ?.map((_updatedObjects) => {
          return _updatedObjects.child;
        });

      if (nodeFound) {
        setCollapsedChildren(modifiedChildrenObjects);
      }
    }

    setIsMeasured(true);
  }, [
    numberOfLines,
    lines,
    collapsedLines,
    seeMore,
    textWidth,
    seeMoreWidth,
    animate,
    ellipsis,
    seeMoreText,
    seeMoreOverlapCount,
    truncatedLineOfImpact,
    children,
    TextComponent,
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

  // use after measured here
  const seeMoreTextHidingStyle = !isMeasured
    ? styles.transparentColor
    : styles.transparentBackground;
  const seeMoreContainerStyle = [
    hideEllipsis
      ? styles.seeMoreContainerEllpisisHidden
      : styles.seeMoreContainer,
    {
      marginRight: seeMoreRightPadding,
    },
  ];

  useEffect(() => {
    setSeeMore(lines.length > numberOfLines);
  }, [numberOfLines, lines]);

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
      // to commence measurement chain
      // we should mount component 1
      // also reset isMeasured
      setMountHiddenTextOne(true);
      setIsMeasured(false);
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
    if (mountHiddenTextTwo && !seeMoreWidth) {
      return;
    }
    // only start measurement after component 2 is unmounted and see more width is calculated
    // since component 1 mounts -> unmounts -> mounts component 2
    // then component 2 unmounts itself
    // and then all measurement params are available
    const handle = setTimeout(measureSeeMoreLine, debounceSeeMoreCalc);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountHiddenTextTwo, seeMoreWidth]);

  useEffect(() => {
    if (!truncatedLineOfImpact) {
      return;
    }

    setMountHiddenTextThree(true);
  }, [truncatedLineOfImpact]);

  useEffect(() => {
    if (!truncatedLineOfImpactWidth) {
      return;
    }

    const padding = textWidth - truncatedLineOfImpactWidth - seeMoreWidth;
    setSeeMoreRightPadding(padding);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truncatedLineOfImpactWidth]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    if (!collapsedChildren) {
      setReconciledLineOfImpact('');
      setReconciledLineOfImpactWidth(0);
      return;
    }

    // re-measure line of impact width
    setMountHiddenTextSix(true);
  }, [collapsedChildren]);

  useEffect(() => {
    if (!reconciledLineOfImpactWidth || !seeMoreWidth || !textWidth) {
      return;
    }
    const _seeMoreRightPadding =
      textWidth - reconciledLineOfImpactWidth - seeMoreWidth;
    if (_seeMoreRightPadding >= 0) {
      setSeeMoreRightPadding(_seeMoreRightPadding);
      if (animate) {
        LayoutAnimation.configureNext(readmoreAnimation);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconciledLineOfImpactWidth, seeMoreWidth, textWidth]);

  return (
    <View style={wrapperStyle}>
      {/* text component to measure see if see more is applicable and get lines */}
      {mountHiddenTextOne && (
        <TextComponent
          {...commonHiddenComponentProps}
          onTextLayout={onTextLayoutOne}>
          {children || ''}
        </TextComponent>
      )}
      {/* text component to measure lines with see less */}
      {mountHiddenTextTwo && (
        <TextComponent
          {...commonHiddenComponentProps}
          onTextLayout={onTextLayoutTwo}>
          {children || ''}
          {/* 3 spaces before see less are intentional */}
          {`   ${seeLessText}`}
        </TextComponent>
      )}
      {/* extract width of line of impact without see more line */}
      {mountHiddenTextThree && (
        <TextComponent
          {...hiddenComponentPropsLineOfImpact}
          onLayout={onLayoutThree}>
          {truncatedLineOfImpact}
        </TextComponent>
      )}
      {/* extract line of impact with collapsed children for remeasurement of right padding on android */}
      {mountHiddenTextSix && (
        <TextComponent
          {...commonHiddenComponentProps}
          numberOfLines={numberOfLines + 1}
          onLayout={onLayoutHiddenTextSix}
          onTextLayout={onTextLayoutHiddenTextSix}>
          {collapsedChildren || ''}
          {/* no see less here since it's in collapsed state replicating original component */}
        </TextComponent>
      )}
      {/* extract width of reconciled line of impact without see more line */}
      {mountHiddenTextSeven && (
        <TextComponent
          {...hiddenComponentPropsLineOfImpact}
          onLayout={onLayoutHiddenTextSeven}>
          {reconciledLineOfImpact}
        </TextComponent>
      )}
      {/* actual text component */}
      <TextComponent
        {...additionalProps}
        {...restProps}
        style={style}
        {...textProps}
        onLayout={onLayoutActualTextComponent}
        onTextLayout={onTextLayoutActualTextComponent}>
        {seeMore && collapsed
          ? collapsedChildren || children || ''
          : children || ''}
        {seeMore && !collapsed && !expandOnly && (
          <TextComponent
            {...additionalProps}
            {...restProps}
            onPress={toggle}
            style={seeLessStyle}>
            {hiddenTextLinesWithSeeLess.length > lines.length ? '\n' : ' '}
            {seeLessText}
          </TextComponent>
        )}
      </TextComponent>
      {/* See more component */}
      {seeMore && collapsed && afterCollapsed && (
        <View style={seeMoreContainerStyle} onLayout={onSeeMoreViewLayout}>
          {!hideEllipsis && (
            <TextComponent
              key={`${isMeasured}-${hideEllipsis}`}
              {...additionalProps}
              {...restProps}
              onPress={toggle}
              style={[
                style,
                seeMoreTextHidingStyle,
                hideEllipsis ? styles.transparentColor : {},
              ]}>
              {`${ellipsis} `}
            </TextComponent>
          )}
          <TextComponent
            {...additionalProps}
            {...restProps}
            onPress={toggle}
            style={[style, seeMoreStyle, seeMoreTextHidingStyle]}>
            {seeMoreText}
          </TextComponent>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
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
  seeMoreContainerEllpisisHidden: {
    position: 'absolute',
    left: 0,
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
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  transparentColor: {
    color: 'transparent',
  },
  hiddenEllpisisText: {
    color: 'transparent',
    position: 'absolute',
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
  onLayout: PropTypes.func,
  onTextLayout: PropTypes.func,
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
  customTextComponent: Text,
  ellipsis: '...',
  onExpand: () => {},
  onCollapse: () => {},
  expandOnly: false,
  seeMoreOverlapCount: 1,
  debounceSeeMoreCalc: 300,
  allowFontScaling: Platform.select({
    android: false,
    ios: undefined,
  }),
  onLayout: () => {},
  onTextLayout: () => {},
};

export default memo(ReadMore);
