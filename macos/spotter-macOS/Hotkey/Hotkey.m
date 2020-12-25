//
//  Hotkey.m
//  spotter-macOS
//
//  Created by Denis on 25.12.20.
//

#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(GlobalHotkey, RCTEventEmitter)

RCT_EXTERN_METHOD(register: (NSString)key withModifier:(NSString)modifier)

@end
