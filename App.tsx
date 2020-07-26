import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

const App = () => {
  const Panel = new NativeEventEmitter(NativeModules.Panel);
  Panel.addListener('onEvent', (res) => console.log('event', res));
  Panel.addListener('onSelected', (res) => console.log('selected', res));
  NativeModules.Panel.registerHotkey();

  NativeModules.Panel.registerOptions([
    {
      title: 'First',
      subtitle: 'First subtitle',
      image: false,
    },
    {
      title: 'Second',
      subtitle: 'Second subtitle',
      image: false,
    },
  ]);

  return (
    <>
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Text>Settings</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

// const styles = StyleSheet.create({});

export default App;
