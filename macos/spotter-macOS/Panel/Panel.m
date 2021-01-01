#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(Panel, RCTEventEmitter)

RCT_EXTERN_METHOD(toggle)

RCT_EXTERN_METHOD(open)

RCT_EXTERN_METHOD(close)

@end
