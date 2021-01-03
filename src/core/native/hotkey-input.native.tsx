import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { SpotterHotkey } from '../shared';

const RNHotkeyInput = requireNativeComponent<any>('RNHotkeyInput');

type InputProps = {
  styles?: ViewStyle,
  hotkey?: SpotterHotkey | null,
  onPressHotkey?: (e: SpotterHotkey) => void,
}

export class HotkeyInput extends React.PureComponent<InputProps> {

  _onChangeHotkey = (event: { nativeEvent: SpotterHotkey }) => {
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
