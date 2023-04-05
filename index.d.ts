import React from 'react';
import { StyleProp, TextStyle, ViewStyle, TextProps } from 'react-native';

export interface ReadMoreProps extends TextProps {
    seeMoreStyle?: StyleProp<TextStyle>;
    seeLessStyle?: StyleProp<TextStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
    seeMoreText?: string;
    seeLessText?: string;
    animate?: boolean;
    customTextComponent?: React.ReactNode;
    ellipsis?: string;
    onExpand?: () => void;
    onCollapse?: () => void;
    expandOnly?: boolean;
    seeMoreOverlapCount?: number;
    debounceSeeMoreCalc?: number;
    onReady?: ({ canExpand: boolean, expandedLinesCount: number }) => void;
    seeMoreContainerStyleSecondary?: StyleProp<ViewStyle>;
    onSeeMore?: () => void;
    onSeeLess?: () => void;
    debug?: boolean;
    collapsed?: boolean;
}
declare const ReadMore: React.FC<ReadMoreProps>;
export default ReadMore;