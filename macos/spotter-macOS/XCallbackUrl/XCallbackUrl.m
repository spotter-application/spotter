#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(XCallbackUrl, RCTEventEmitter)

RCT_EXTERN_METHOD(command: (NSDictionary)data)

@end
