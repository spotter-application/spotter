#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(StatusBar, RCTEventEmitter)

RCT_EXTERN_METHOD(changeTitle: (NSString)title)

@end
