import React from 'react';
import { StyleSheet, View } from 'react-native';
import ReadMore from './src/ReadMore';

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
