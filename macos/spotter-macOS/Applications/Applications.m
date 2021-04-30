#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(Applications, RCTEventEmitter)

RCT_EXTERN_METHOD(setDimensions: (NSString)appName x: (NSString)x y: (NSString)y width: (NSString)width height: (NSString)height)

RCT_EXTERN_METHOD(getDimensions: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getRunningList: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

@end
