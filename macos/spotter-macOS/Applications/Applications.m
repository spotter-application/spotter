//
//  Applications.m
//  spotter-macOS
//
//  Created by Denis Zyulev on 28/07/2020.
//

#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(Applications, RCTEventEmitter)

RCT_EXTERN_METHOD(getAll: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(open: (NSString)command)

RCT_EXTERN_METHOD(setDimensions: (NSString)appName x: (NSString)x y: (NSString)y width: (NSString)width height: (NSString)height)

@end
