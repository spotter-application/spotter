import { Hotkey } from '@spotter-app/core';
import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';

const RNHotkeyInput = requireNativeComponent<any>('RNHotkeyInput');

type InputProps = {
  styles?: ViewStyle,
  hotkey?: Hotkey | null,
  onPressHotkey?: (e: Hotkey) => void,
}

export class HotkeyInput extends React.PureComponent<InputProps> {

  _onChangeHotkey = (event: { nativeEvent: Hotkey }) => {
    if (!this.props.onPressHotkey) {
      return;
    }
    this.props.onPressHotkey(event?.nativeEvent)
  }

  render() {
    const nativeProps = {
      ...this.props,
      onChangeHotkey: this._onChangeHotkey,
    }

    return <RNHotkeyInput
      {...nativeProps}
      style={this.props.styles}
    />
  }
}
