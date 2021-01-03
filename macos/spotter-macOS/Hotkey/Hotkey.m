#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(GlobalHotkey, RCTEventEmitter)

RCT_EXTERN_METHOD(register: (NSDictionary)hotkey)

@end
