#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RNHotkeyInput, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(hotkey, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(onChangeHotkey, RCTDirectEventBlock)
@end
