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
    onReady?: () => void;
    seeMoreContainerStyleSecondary?: StyleProp<ViewStyle>;
}
declare const ReadMore: React.FC<ReadMoreProps>;
export default ReadMore;