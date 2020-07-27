//
//  Shell.m
//  spotter-macOS
//
//  Created by Denis Zyulev on 27/07/2020.
//

#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(Shell, RCTEventEmitter)

RCT_EXTERN_METHOD(execute: (NSString)command)

@end
