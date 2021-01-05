import React from 'react';
import { requireNativeComponent } from 'react-native';

const RNIconImage = requireNativeComponent<any>('RNIconImage');

type Props = {
  source: string,
}

export class IconImageNative extends React.PureComponent<Props> {

  render() {
    const nativeProps = {
      ...this.props,
    }

    return <RNIconImage
      {...nativeProps}
      style={{ padding: 17, backgroundColor: 'transparent'}}
    />
  }
}
