import React from 'react';
import { StyleProp, TextStyle, ViewStyle, LayoutChangeEvent, NativeSyntheticEvent, TextLayoutEventData } from 'react-native';

export interface ReadMoreProps {
    style?: StyleProp<TextStyle>;
    seeMoreStyle?: StyleProp<TextStyle>;
    seeLessStyle?: StyleProp<TextStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    numberOfLines?: number;
    seeMoreText?: string;
    seeLessText?: string;
    animate?: boolean;
    customTextComponent?: React.ReactNode;
    ellipsis?: string;
    allowFontScaling?: boolean;
    onExpand?: () => void;
    onCollapse?: () => void;
    expandOnly?: boolean;
    seeMoreOverlapCount?: number;
    debounceSeeMoreCalc?: number;
    onLayout?: (event: LayoutChangeEvent) => void;
    onTextLayout?: (event: NativeSyntheticEvent<TextLayoutEventData>) => void;
    onReady?: () => void;
    seeMoreContainerStyleSecondary: StyleProp<ViewStyle>;
}
declare const ReadMore: React.FC<ReadMoreProps>;
export default ReadMore;