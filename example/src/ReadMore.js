import React, {memo, useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  TextPropTypes,
} from 'react-native';
import {getTextByChildren, insertAt, linesToCharacters} from './helper';

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

const logClosure =
  printLogs =>
  (...args) => {
    if (!printLogs) {
      return;
    }
    return console.log(...args);
  };

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
  onReady,
  seeMoreContainerStyleSecondary,
  onSeeMoreBlocked,
  debug,
  ...restProps
}) => {
  const [additionalProps, setAdditionalProps] = useState({});
  // hiddenTextLinesWithSeeLess comes from hidden component two
  const [hiddenTextLinesWithSeeLess, setHiddenTextLinesWithSeeLess] = useState(
    [],
  );
  const [textWidth, setTextWidth] = useState(0);
  const [truncatedLineOfImpact, setTruncatedLineOfImpact] = useState('');
  const [truncatedLineOfImpactWidth, setTruncatedLineOfImpactWidth] =
    useState(0);
  const [lines, setLines] = useState([]);
  const [collapsedLines, setCollapsedLines] = useState([]);
  const [seeMoreRightPadding, setSeeMoreRightPadding] = useState(0);
  // mount or unmount hidden components
  const [mountHiddenTextOne, setMountHiddenTextOne] = useState(false);
  const [mountHiddenTextTwo, setMountHiddenTextTwo] = useState(false);
  const [mountHiddenTextThree, setMountHiddenTextThree] = useState(false);
  const [mountHiddenTextFour, setMountHiddenTextFour] = useState(false);
  const [mountHiddenTextFive, setMountHiddenTextFive] = useState(false);
  const [mountHiddenTextSix, setMountHiddenTextSix] = useState(false);
  // initial measurement is in progress
  const [isMeasured, setIsMeasured] = useState(false);
  const [isReady, setIsReady] = useState(false);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const log = useCallback(logClosure(debug), [debug]);

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
      setMountHiddenTextThree(true);
    },
    [
      setHiddenTextLinesWithSeeLess,
      setMountHiddenTextTwo,
      setMountHiddenTextThree,
    ],
  );

  const onLayoutHiddenTextThree = useCallback(
    event => {
      const _event = event; // clone event
      const _width = _event?.nativeEvent?.layout?.width || 0;
      setTextWidth(_width);
      setMountHiddenTextThree(false);
    },
    [setTextWidth, setMountHiddenTextThree],
  );

  const onTextLayoutHiddenTextThree = useCallback(
    event => {
      const _event = event; // clone event
      if (collapsed) {
        const _lines = _event?.nativeEvent?.lines || [];
        setCollapsedLines(_lines);
      }
    },
    [setCollapsedLines, collapsed],
  );

  const onLayoutFour = useCallback(
    ({
      nativeEvent: {
        layout: {width},
      },
    }) => {
      setTruncatedLineOfImpactWidth(width);
      setMountHiddenTextFour(false);
      setMountHiddenTextFive(true);
    },
    [
      setTruncatedLineOfImpactWidth,
      setMountHiddenTextFour,
      setMountHiddenTextFive,
    ],
  );

  const onLayoutHiddenTextFive = useCallback(() => {
    setMountHiddenTextFive(false);
    setMountHiddenTextSix(true);
  }, [setMountHiddenTextFive, setMountHiddenTextSix]);

  const onTextLayoutHiddenTextFive = useCallback(
    ({nativeEvent: {lines: _lines}}) => {
      const _lineOfImpact = _lines[numberOfLines - 1];
      setReconciledLineOfImpact(_lineOfImpact?.text?.trimEnd?.() || '');
    },
    [numberOfLines, setReconciledLineOfImpact],
  );

  const onLayoutHiddenTextSix = useCallback(
    ({
      nativeEvent: {
        layout: {width},
      },
    }) => {
      setMountHiddenTextSix(false);
      setReconciledLineOfImpactWidth(reconciledLineOfImpact ? width : 0);
    },
    [
      setReconciledLineOfImpactWidth,
      setMountHiddenTextSix,
      reconciledLineOfImpact,
    ],
  );

  const toggle = useCallback(() => {
    if (onSeeMoreBlocked) {
      onSeeMoreBlocked();
    } else {
      setCollapsed(prev => !prev);
    }
  }, [setCollapsed, onSeeMoreBlocked]);

  const updateLineOfImpact = useCallback(
    (_text = '', resetCollapsedChildren = true) => {
      setHideEllipsis(!_text?.length);
      setTruncatedLineOfImpact(_text || '');

      if (!_text?.length) {
        // reset width if no text
        // otherwise an effect will update the width
        setTruncatedLineOfImpactWidth(0);
        setReconciledLineOfImpactWidth(0);
        setSeeMoreRightPadding(0);
        setIsMeasured(true);
      }

      if (resetCollapsedChildren) {
        setCollapsedChildren(null);
      }
    },
    [
      setHideEllipsis,
      setTruncatedLineOfImpact,
      setTruncatedLineOfImpactWidth,
      setCollapsedChildren,
      setIsMeasured,
    ],
  );

  const measureSeeMoreLine = useCallback(() => {
    if (
      numberOfLines < 1 ||
      !lines.length ||
      !collapsedLines.length ||
      !seeMore ||
      !seeMoreWidth
    ) {
      log('terminating measurements for see more - 1');
      return;
    }

    if (!lines[numberOfLines - 1] || !collapsedLines[numberOfLines - 1]) {
      log('terminating measurements for see more - 2');
      return;
    }

    // find line of impact
    let _lineOfImpact = lines[numberOfLines - 1];
    _lineOfImpact.index = numberOfLines - 1;
    if (Platform.OS === 'ios') {
      const modifiedIndex = lines.findIndex((_line, index) => {
        if (index < numberOfLines - 1 || !_line.text?.trimEnd?.()) {
          return false;
        }
        return collapsedLines[numberOfLines - 1].text.includes(_line.text);
      });
      if (modifiedIndex !== -1) {
        _lineOfImpact = lines[modifiedIndex];
        _lineOfImpact.index = modifiedIndex;
      }
    }

    const _trimmedText = _lineOfImpact?.text?.trimEnd?.();

    // calculate how many characters to cut off if any
    // trim right before -> spaces and \n
    // width from line, textWidth, seeMoreWidth

    if (_trimmedText?.length && !textWidth) {
      // textWidth is being measured
      return;
    }

    // case 1
    log('case 1');
    // if no text after right trim
    // hide ellipsis
    // move see more to beginning
    if (!_trimmedText?.length) {
      return updateLineOfImpact(_trimmedText);
    }

    const availableWidth = textWidth - seeMoreWidth;

    // case 2
    log('case 2');
    // text is there but no need to put \n
    // enough space for see more text on right side
    if (_lineOfImpact.width < availableWidth) {
      return updateLineOfImpact(_trimmedText);
    }

    const seeMoreTextLength =
      `${ellipsis} ${seeMoreText}`.length + seeMoreOverlapCount;

    // case 3
    log('case 3');
    // many spaces at the end of text
    // so still no need to cutoff the text at end with \n
    const spaceDifference = _lineOfImpact?.text?.length - _trimmedText?.length;
    if (spaceDifference >= seeMoreTextLength) {
      return updateLineOfImpact(_trimmedText);
    }

    // case 4
    log('case 4');
    // create collapsed children with \n at the point
    const linesTillImpact = Array(_lineOfImpact.index + 1)
      .fill({})
      .map((_e, index) => lines[index]);
    const charactersBeforeSeeMore = linesToCharacters(linesTillImpact);
    const charactersLengthTillSeeMore =
      charactersBeforeSeeMore?.trimEnd?.()?.length || 0;
    // text break position for collapsed text
    const textBreakPosition = charactersLengthTillSeeMore - seeMoreTextLength;

    const _truncatedText =
      _trimmedText
        ?.substr(0, _trimmedText.length - seeMoreTextLength)
        ?.trimEnd?.() || '';

    // go to this position and insert \n
    let charactersToTraverse = textBreakPosition;
    let nodeFound = false;
    const modifiedChildrenObjects = getTextByChildren(children, TextComponent)
      ?.map(_childObject => {
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
      ?.map(_updatedObjects => {
        return _updatedObjects.child;
      });

    if (nodeFound) {
      setCollapsedChildren(modifiedChildrenObjects);
      return updateLineOfImpact(_truncatedText, false);
    }

    // todo: inform user
    // error case
    return updateLineOfImpact(_trimmedText);
  }, [
    numberOfLines,
    lines,
    collapsedLines,
    seeMore,
    textWidth,
    seeMoreWidth,
    ellipsis,
    seeMoreText,
    seeMoreOverlapCount,
    children,
    TextComponent,
    updateLineOfImpact,
    log,
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
    const _seeMore = lines.length > numberOfLines;
    setSeeMore(_seeMore);

    if (!lines?.length) {
      return;
    }

    if (!_seeMore) {
      log('no measurement is needed');
      onReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfLines, lines]);

  useEffect(() => {
    if (collapsed === afterCollapsed) {
      return;
    }

    const callback = collapsed ? onCollapse : onExpand;
    if (animate) {
      LayoutAnimation.configureNext(readmoreAnimation, callback);
    } else {
      callback();
    }
    setAfterCollapsed(collapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  useEffect(() => {
    const handle = setTimeout(() => {
      // to commence measurement chain
      // we should mount component 1
      // also reset isMeasured
      setMountHiddenTextOne(true);
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
    // a map of additional props to be passed down
    // in hidden text components other than style
    // for accurate measurements
    const _additionalProps = {};

    // pick selected params
    if (allowFontScaling !== undefined) {
      _additionalProps.allowFontScaling = allowFontScaling;
    }

    setAdditionalProps(_additionalProps);
  }, [allowFontScaling]);

  useEffect(() => {
    if (mountHiddenTextTwo && !seeMoreWidth && collapsedLines?.length) {
      return;
    }
    // only start measurement after component 2 is unmounted and see more width is calculated
    // since component 1 mounts -> unmounts -> mounts component 2
    // then component 2 unmounts itself
    // and then all measurement params are available
    const handle = setTimeout(measureSeeMoreLine, debounceSeeMoreCalc);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountHiddenTextTwo, seeMoreWidth, collapsedLines, textWidth]);

  useEffect(() => {
    if (!truncatedLineOfImpact) {
      return;
    }

    setMountHiddenTextFour(true);
  }, [truncatedLineOfImpact]);

  useEffect(() => {
    if (
      !(truncatedLineOfImpactWidth || reconciledLineOfImpactWidth) ||
      !seeMoreWidth ||
      !textWidth
    ) {
      return;
    }

    const _width =
      reconciledLineOfImpactWidth || truncatedLineOfImpactWidth || 0;

    let _seeMoreRightPadding = textWidth - _width - seeMoreWidth;
    _seeMoreRightPadding = _seeMoreRightPadding < 0 ? 0 : _seeMoreRightPadding;

    setSeeMoreRightPadding(_seeMoreRightPadding);

    setIsMeasured(true);
  }, [
    truncatedLineOfImpactWidth,
    reconciledLineOfImpactWidth,
    seeMoreWidth,
    textWidth,
  ]);

  useEffect(() => {
    if (!isMeasured || isReady) {
      return;
    }

    const handle = setTimeout(() => {
      setIsReady(true);
      onReady();
    }, debounceSeeMoreCalc);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMeasured, isReady]);

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
      {mountHiddenTextFour && (
        <TextComponent
          {...hiddenComponentPropsLineOfImpact}
          onLayout={onLayoutFour}>
          {truncatedLineOfImpact}
        </TextComponent>
      )}
      {mountHiddenTextThree && (
        <TextComponent
          {...commonHiddenComponentProps}
          numberOfLines={numberOfLines}
          ellipsizeMode={'clip'}
          onLayout={onLayoutHiddenTextThree}
          onTextLayout={onTextLayoutHiddenTextThree}>
          {children || ''}
        </TextComponent>
      )}
      {/* extract line of impact with collapsed children for remeasurement of right padding on android */}
      {mountHiddenTextFive && (
        <TextComponent
          {...commonHiddenComponentProps}
          numberOfLines={numberOfLines + 1}
          onLayout={onLayoutHiddenTextFive}
          onTextLayout={onTextLayoutHiddenTextFive}>
          {collapsedChildren || ''}
          {/* no see less here since it's in collapsed state replicating original component */}
        </TextComponent>
      )}
      {/* extract width of reconciled line of impact without see more line */}
      {mountHiddenTextSix && (
        <TextComponent
          {...hiddenComponentPropsLineOfImpact}
          onLayout={onLayoutHiddenTextSix}>
          {reconciledLineOfImpact}
        </TextComponent>
      )}
      {/* actual text component */}
      <TextComponent
        {...additionalProps}
        {...restProps}
        style={style}
        {...textProps}>
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
        <View
          style={[seeMoreContainerStyle, seeMoreContainerStyleSecondary]}
          onLayout={onSeeMoreViewLayout}>
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
  },
  hiddenTextAbsoluteCompact: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: 'transparent',
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
  ...TextPropTypes,
  seeMoreStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  seeLessStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  wrapperStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  seeMoreText: PropTypes.string,
  seeLessText: PropTypes.string,
  animate: PropTypes.bool,
  customTextComponent: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.element,
    PropTypes.elementType,
  ]),
  ellipsis: PropTypes.string,
  onExpand: PropTypes.func,
  onCollapse: PropTypes.func,
  expandOnly: PropTypes.bool,
  seeMoreOverlapCount: PropTypes.number,
  debounceSeeMoreCalc: PropTypes.number,
  onReady: PropTypes.func,
  seeMoreContainerStyleSecondary: PropTypes.object,
  onSeeMoreBlocked: PropTypes.func,
  debug: PropTypes.bool,
};

ReadMore.defaultProps = {
  style: styles.defaultText,
  seeMoreStyle: StyleSheet.flatten([styles.defaultText, styles.seeMoreText]),
  seeLessStyle: StyleSheet.flatten([styles.defaultText, styles.seeLessText]),
  wrapperStyle: styles.container,
  numberOfLines: 3,
  seeMoreText: 'See more',
  seeLessText: 'See less',
  animate: true,
  customTextComponent: Text,
  ellipsis: '...',
  onExpand: () => {},
  onCollapse: () => {},
  expandOnly: false,
  seeMoreOverlapCount: 2,
  debounceSeeMoreCalc: 300,
  allowFontScaling: Platform.select({
    android: false,
    ios: undefined,
  }),
  onReady: () => {},
  seeMoreContainerStyleSecondary: {},
  onSeeMoreBlocked: undefined,
  debug: false,
};

export default memo(ReadMore);
