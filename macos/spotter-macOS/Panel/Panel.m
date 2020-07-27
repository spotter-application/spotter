//
//  Panel.m
//  spotter-macOS
//
//  Created by Denis Zyulev on 11/07/2020.
//
#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(Panel, RCTEventEmitter)

RCT_EXTERN_METHOD(registerHotkey)

RCT_EXTERN_METHOD(displayOptions: (NSArray)options)

@end
