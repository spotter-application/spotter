import React from 'react';
import { ImageStyle, requireNativeComponent } from 'react-native';

const RNIconImage = requireNativeComponent<any>('RNIconImage');

type Props = {
  source: string,
  style: ImageStyle,
}

export class IconImage extends React.PureComponent<Props> {

  render() {
    const nativeProps = {
      ...this.props,
    }

    return <RNIconImage
      {...nativeProps}
      style={{ width: 25, height: 25, ...this.props.style }}
    />
  }
}
