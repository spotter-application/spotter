#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(SpotterHotkey, RCTEventEmitter)

RCT_EXTERN_METHOD(register: (NSDictionary)hotkey withIdentifier:(NSString)identifier)

@end
