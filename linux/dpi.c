#include <stdio.h>
#include <stdlib.h>
#include <X11/Xlib.h>
#include <X11/Xresource.h>

// TODO: use g_object_get(settings, "gtk-xft-dpi", &dpiValue, NULL); instead
double getScale(void)
{
  Display *display = XOpenDisplay(NULL);
  XrmDatabase xrdb = XrmGetStringDatabase(XResourceManagerString(display));

  char *str_type;
  XrmValue value;
  XrmGetResource(xrdb, "Xft.dpi", "Xft.Dpi", &str_type, &value);
  double scale = atoi(value.addr) / 96.0;

  XrmDestroyDatabase(xrdb);
  XCloseDisplay(display);

  return scale;
}
