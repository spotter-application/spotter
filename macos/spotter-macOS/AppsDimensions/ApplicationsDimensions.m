#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(AppsDimensions, RCTEventEmitter)

RCT_EXTERN_METHOD(setValue: (NSString)appName x: (NSString)x y: (NSString)y width: (NSString)width height: (NSString)height)

RCT_EXTERN_METHOD(getValue: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

@end
