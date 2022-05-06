#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(Notifications, RCTEventEmitter)

RCT_EXTERN_METHOD(show: (NSString)title withSubtitle:(NSString)subtitle)

@end
