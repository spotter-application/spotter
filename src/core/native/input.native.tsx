import React from 'react';
import { requireNativeComponent } from 'react-native';

const RNInput = requireNativeComponent<any>('RNInput');

type InputProps = {
  value: string,
  placeholder: string,
  onChangeText: (text: string) => void,
  onSubmit: (text: string) => void,
  onEscape: () => void,
  onArrowDown: () => void,
  onArrowUp: () => void,
}

export class InputNative extends React.PureComponent<InputProps> {

  _onChangeText = (event: { nativeEvent: { text: string }}) => {
    if (!this.props.onChangeText) {
      return;
    }
    this.props.onChangeText(event?.nativeEvent?.text)
  }

  _onSubmit = (event: { nativeEvent: { text: string } }) => {
    if (!this.props.onSubmit) {
      return;
    }
    this.props.onSubmit(event?.nativeEvent?.text)
  }

  _onEscape = () => {
    if (!this.props.onEscape) {
      return;
    }
    this.props.onEscape()
  }

  _onArrowDown = () => {
    if (!this.props.onArrowDown) {
      return;
    }
    this.props.onArrowDown()
  }

  _onArrowUp = () => {
    if (!this.props.onArrowUp) {
      return;
    }
    this.props.onArrowUp()
  }

  render() {
    const nativeProps = {
      ...this.props,
      onChangeText: this._onChangeText,
      onSubmit: this._onSubmit,
      onEscape: this._onEscape,
      onArrowDown: this._onArrowDown,
      onArrowUp: this._onArrowUp,
    }

    return <RNInput {...nativeProps} style={{padding: 17, backgroundColor: 'transparent'}}/>
  }
}
