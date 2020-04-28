const ffi = require("@saleae/ffi");
const child_process = require("child_process");
const W32 = require("./w32");

const argv = process.argv.slice(2);

if (!argv || !argv.length) process.exit(1);

const play = child_process.fork("./play.js");

// ffplay -noborder -loop 0 -fs -vf scale=w=1920:h=-1 "${argv[0]}"
// -noborder 无边框
// -loop 0 循环次数，0无限循环
// -fs 设置限制文件大小（以字节为单位)
// -vf scale=w=1920:h=-1 使用scale滤镜, See also: https://trac.ffmpeg.org/wiki/Scaling
play.send(`ffplay -noborder -loop 0 "${argv[0]}" `);
play.on("message", () => {
  fundFFplayHnadle().then(setDynamicWallpaper);
});

function fundFFplayHnadle() {
  let ffplayw = 0; // ffplay句柄
  let t;
  return new Promise((res) => {
    t = setInterval(() => {
      ffplayw = getFFplayHandle();
      if (ffplayw !== 0) {
        clearInterval(t);
        res(ffplayw);
      }
    }, 1000);
  });
}

function setDynamicWallpaper(ffplayw) {
  const progman = W32.FindWindowW(TEXT("Progman"), null);

  // 要触发在桌面图标和墙纸之间创建WorkerW窗口，我们必须向程序管理器发送一条消息。
  // 该消息是未记录的消息，因此没有专用的Windows API名称，除了0x052C
  W32.SendMessageTimeoutW(
    progman,
    0x052c, // 在程序管理器上生成墙纸工作程序的未记录消息
    0,
    0,
    0x0000,
    1000,
    0
  );

  // 我们枚举所有Windows
  W32.EnumWindows(
    ffi.Callback("bool", ["int32", "int32"], (tophandle, topparamhandle) => {
      // 找到一个具有SHELLDLL_DefView的Windows
      const SHELLDLL_DefView = W32.FindWindowExW(
        tophandle,
        0,
        TEXT("SHELLDLL_DefView"),
        0
      );
      if (SHELLDLL_DefView !== 0) {
        // 将其下一个同级分配给workerw。
        const workerw = W32.FindWindowExW(0, tophandle, TEXT("WorkerW"), 0);
        const isVisible = W32.IsWindowVisible(workerw);
        if (isVisible) {
          // 设置窗口为未激活状态，否则这个窗口会遮挡视频
          W32.ShowWindow(workerw, 0);
        }
        W32.SetParent(ffplayw, progman);
      }
      return true;
    }),
    0
  );
}

function TEXT(text) {
  return Buffer.from(`${text}\0`, "ucs2");
}

// 获取ffplay句柄
function getFFplayHandle() {
  return W32.FindWindowW(TEXT("SDL_app"), null);
}
