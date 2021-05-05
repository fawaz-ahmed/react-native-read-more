![NPM Downloads](https://img.shields.io/npm/dw/@fawazahmed/react-native-read-more) ![NPM License](https://img.shields.io/npm/l/@fawazahmed/react-native-read-more) ![NPM Version](https://img.shields.io/npm/v/@fawazahmed/react-native-read-more)

#### Please :star: it, thanks :thumbsup:
# react-native-read-more
React native library to show text in a condensed way and expand when needed. Can be used with native or expo on all platforms.

![Example](example/seemore.gif)

### Installation

```
npm i @fawazahmed/react-native-read-more --save
```

or with yarn

```
yarn add @fawazahmed/react-native-read-more
```

### Usage

```javascript

import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import ReadMore from '@fawazahmed/react-native-read-more';

const Home = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ReadMore numberOfLines={3} style={styles.textStyle}>
          {
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          }
        </ReadMore>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flex: 1,
    padding: 16,
  },
  textStyle: {
    fontSize: 14,
  },
});

export default Home;

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
| `backgroundColor` | `string` | no | (deprecated) defaults to `white` => supply `backgroundColor` if your background color is something other than white
| `customTextComponent` | `React component` | no | defaults to `Text`
| `expandOnly` | `bool` | no | defaults to `false` => hide see less option similar to a linkedIn post
| `onExpand` | `func` | no | optional callback executed when expanded
| `onCollapse` | `func` | no | optional callback executed when collapsed
| `preserveLinebreaks` | `bool` | no | (deprecated) defaults to `false` => preserves `\n` in the content while in the collapsed state. This prop is in experimental stage.

Any additional props are passed down to underlying `Text` component.

# Run example
```
git clone https://github.com/fawaz-ahmed/react-native-read-more.git
cd react-native-read-more/example
yarn install # or npm install

# to run on iOS
yarn ios

#to run on android
yarn android
```

# Why another library ?
This module will calculate where to position `See more` and `See less` within the same paragraph instead of occupying another line. It is a drop-in replacement for `Text` component and you can control when to apply the see more functionality by configuring the `numberOfLines` prop. Moreover, you can also pass your own custom implementation of `Text` component like `ParsedText` etc.

## Seeing issues or any feedback or feature suggest ?
Create an [issue](https://github.com/fawaz-ahmed/react-native-read-more/issues) with github.

## Troubleshooting
- If you observe `See more` shown always in android, pass prop `allowFontScaling={false}`, refer to this [issue](https://github.com/fawaz-ahmed/react-native-read-more/issues/17)

### jest - running unit tests
This package is not transpiled. So inorder for your test cases to work, this package should be transpiled by babel. For this you need to add this path `!node_modules/@fawazahmed/react-native-read-more/` under `transformIgnorePatterns` option provided by `jest`. In your `package.json` you will see this `jest` config:
```
"jest": {
  "preset": "react-native",
  "transformIgnorePatterns": [
    "!node_modules/@fawazahmed/react-native-read-more/" // add this line
  ]
}
```
refer to jest docs [here](https://jestjs.io/docs/en/tutorial-react-native#transformignorepatterns-customization) and github [issue](https://github.com/fawaz-ahmed/react-native-read-more/issues/19)
