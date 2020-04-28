const ffi = require("@saleae/ffi");

// Import user32
const W32 = new ffi.Library("user32", {
  // 检索顶级窗口的句柄，该顶级窗口的类名和窗口名与指定的字符串匹配。此功能不搜索子窗口。此功能不执行区分大小写的搜索。
  FindWindowW: ["int32", ["string", "string"]],

  // 将指定的消息发送到一个或多个窗口
  SendMessageTimeoutW: [
    "int32",
    ["int32", "int32", "int32", "int32", "int32", "int32", "int32"],
  ],

  // 通过将句柄传递给每个窗口，依次传递到应用程序定义的回调函数，可以枚举屏幕上所有的顶级窗口
  EnumWindows: ["bool", ["pointer", "int32"]],

  // 检索其类名和窗口名与指定字符串匹配的窗口的句柄。该功能搜索子窗口，从指定子窗口之后的子窗口开始。此功能不执行区分大小写的搜索。
  FindWindowExW: ["int32", ["int32", "int32", "string", "int32"]],

  // 更改指定子窗口的父窗口。
  // HWND SetParent(HWND hWndChild, HWND hWndNewParent);
  SetParent: ["int32", ["int32", "int32"]],

  // int MessageBox(
  //   HWND    hWnd, 要创建的消息框的所有者窗口的句柄。如果此参数为NULL，则消息框没有所有者窗口
  //   LPCTSTR lpText, 要显示的消息
  //   LPCTSTR lpCaption, 对话框标题
  //   UINT    uType 对话框的内容和行为
  // );
  MessageBoxW: ["int32", ["int32", "string", "string", "int32"]],

  // 最小化（但不破坏）指定的窗口。
  CloseWindow: ["bool", ["int32"]],

  // 销毁指定的窗口
  DestroyWindow: ["bool", ["int32"]],

  // 打开指定的桌面对象
  OpenDesktopW: ["int32", ["string", "int32", "bool", "int32"]],

  // 确定指定窗口的可见性状态。
  IsWindowVisible: ["bool", ["int32"]],

  // 设置指定窗口的显示状态。
  ShowWindow: ["bool", ["int32", "int32"]],
});

module.exports = W32;
