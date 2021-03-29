import React from 'react';
import { requireNativeComponent, Text, TextStyle, View } from 'react-native';

const RNInput = requireNativeComponent<any>('RNInput');

type InputProps = {
  value: string,
  placeholder: string,
  disabled?: boolean,
  fontSize?: number,
  hint?: string,
  style?: TextStyle,
  onChangeText?: (text: string) => void,
  onSubmit?: () => void,
  onEscape?: () => void,
  onArrowDown?: () => void,
  onArrowUp?: () => void,
  onCommandComma?: () => void,
  onTab?: () => void,
  onShiftTab?: () => void,
  onShiftEnter?: () => void,
  onBackspace?: (text: string) => void,
};

type InputState = {
  formatedHint: string | null,
};

export class InputNative extends React.PureComponent<InputProps, InputState> {

  constructor(props: InputProps) {
    super(props);
    this.state = { formatedHint: null };
  }

  UNSAFE_componentWillReceiveProps(nextProps: InputProps) {
    if (!nextProps.hint) {
      this.setState({ formatedHint: null });
    }

    if (nextProps.value && nextProps.hint) {
      const lowerValue = nextProps.value.toLowerCase();
      const lowerHint = nextProps.hint.toLowerCase();
      const hintIndex = lowerHint.indexOf(lowerValue);

      if (hintIndex !== -1) {
        this.setState({
          formatedHint: lowerHint.substring(hintIndex),
        });
      }

    }
  }

  _onChangeText = (event: { nativeEvent: { text: string }}) => {
    if (!this.props.onChangeText) {
      return;
    }
    this.props.onChangeText(event?.nativeEvent?.text)
  }

  _onSubmit = () => {
    if (!this.props.onSubmit) {
      return;
    }
    this.props.onSubmit()
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

  _onCommandComma = () => {
    if (!this.props.onCommandComma) {
      return;
    }
    this.props.onCommandComma()
  }

  _onTab = () => {
    if (!this.props.onTab) {
      return;
    }
    this.props.onTab()
  }

  _onShiftTab = () => {
    if (!this.props.onShiftTab) {
      return;
    }
    this.props.onShiftTab()
  }

  _onShiftEnter = () => {
    if (!this.props.onShiftEnter) {
      return;
    }
    this.props.onShiftEnter()
  }

  _onBackspace = (event: { nativeEvent: { text: string } }) => {
    if (!this.props.onBackspace) {
      return;
    }
    this.props.onBackspace(event.nativeEvent.text)
  }

  render() {
    const nativeProps = {
      ...this.props,
      onChangeText: this._onChangeText,
      onSubmit: this._onSubmit,
      onEscape: this._onEscape,
      onArrowDown: this._onArrowDown,
      onArrowUp: this._onArrowUp,
      onCommandComma: this._onCommandComma,
      onTab: this._onTab,
      onShiftTab: this._onShiftTab,
      onShiftEnter: this._onShiftEnter,
      onBackspace: this._onBackspace,
    }

    return <View
      style={{ position: 'relative', ...(this.props.style ? this.props.style : {})}}
    >
      <RNInput
        {...nativeProps}
        style={{ padding: 17, backgroundColor: 'transparent', flex: 1 }}
      />
      {this.state.formatedHint ? <Text
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 2,
          margin: 'auto',
          fontSize: 26,
          opacity: 0.5,
        }}>
          {this.state.formatedHint}
        </Text> : null}
    </View>
  }
}
