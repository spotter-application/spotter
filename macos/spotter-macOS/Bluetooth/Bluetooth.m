#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(NativeBluetooth, RCTEventEmitter)

RCT_EXTERN_METHOD(getDevices: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectDevice: (NSString)address)

RCT_EXTERN_METHOD(disconnectDevice: (NSString)address)

@end
