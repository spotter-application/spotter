#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RNInput, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(onChangeText, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSubmit, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onEscape, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onArrowDown, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onArrowUp, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onCommandComma, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(placeholder, NSString)
RCT_EXPORT_VIEW_PROPERTY(value, NSString)
RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(fontSize, NSNumber)
@end
