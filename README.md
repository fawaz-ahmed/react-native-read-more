![NPM Downloads](https://img.shields.io/npm/dw/@fawazahmed/react-native-read-more) ![NPM License](https://img.shields.io/npm/l/@fawazahmed/react-native-read-more) ![NPM Version](https://img.shields.io/npm/v/@fawazahmed/react-native-read-more)

#### Please :star: it, thanks :thumbsup:
# react-native-read-more
React native library to show text in a condensed way and expand when needed. Can be used with native or expo on all platforms.

![Example](example/seemore.gif)

# Why another library ?
This package is different from regular see more/less components available out there. It's smart enough to calculate where to position `See more` and `See less` within the same paragraph instead of occupying another line. It is a drop-in replacement for `Text` component and you can control when to apply the see more functionality by configuring the `numberOfLines` prop. Moreover, you can also pass your own custom implementation of `Text` component like `ParsedText` etc.

### Installation

```
npm i @fawazahmed/react-native-read-more --save
```

or with yarn

```
yarn add @fawazahmed/react-native-read-more
```
## Props

| Prop | Type | Required | Note |
|---|---|---|---|
| `style` | `object or array` | no | text style
| `seeMoreText` | `string` | no | defaults to `See more`
| `seeMoreStyle` | `object or array` | no | text style for `See more` text
| `seeLessText` | `string` | no | defaults to `See less`
| `seeLessStyle` | `object or array` | no | text style for `See less` text
| `ellipsis` | `string` | no | defaults to `...`
| `wrapperStyle` | `object or array` | no | style for wrapper `View`
| `numberOfLines` | `number` | no | defaults to `3`
| `animate` | `bool` | no | defaults to `true` => applies a subtle animation to see more and see less text, not the complete text itself
| `backgroundColor` | `string` | no | defaults to `white` => supply `backgroundColor` if your background color is something other than white
| `customTextComponent` | `React component` | no | defaults to `Text`

Any additional props are passed down to underlying `Text` component.

### Usage

```javascript

import React from 'react';
import { StyleSheet, View } from 'react-native';
import ReadMore from '@fawazahmed/react-native-read-more';

const App = () => {
  return (
    <View style={styles.root}>
      <ReadMore>
        {`Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`}
      </ReadMore>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    marginTop: 48,
  },
});

export default App;
```

## Seeing issues ?
Create an issue with github.
