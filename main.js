const { node_windows_x64: nw } = require("node-windows-x64");
const child_process = require("child_process");

const argv = process.argv.slice(2);

if (!argv || !argv.length) process.exit(1);

const play = child_process.fork("./play.js");

// ffplay -noborder -loop 0 -fs -vf scale=w=1920:h=-1 "${argv[0]}"
// -noborder 无边框
// -loop 0 循环次数，0无限循环
// -fs 设置限制文件大小（以字节为单位)
// -vf scale=w=1920:h=-1 使用scale滤镜, See also: https://trac.ffmpeg.org/wiki/Scaling
play.send(`ffplay -noborder -vf scale=w=1920:h=-1 -loop 0 "${argv[0]}" `);
play.on("message", () => {
  findFFplayHandle().then(setDynamicWallpaper);
});

// 获取ffplay窗口句柄
function findFFplayHandle() {
  let ffplayw = 0;
  let t;
  return new Promise((res) => {
    t = setInterval(() => {
      ffplayw = nw.FindWindowA("SDL_app", null);
      if (ffplayw) {
        clearInterval(t);
        res(ffplayw);
      }
    }, 1000);
  });
}

function setDynamicWallpaper(ffplayw) {
  const progman = nw.FindWindowA("Progman", null);

  // 要触发在桌面图标和墙纸之间创建WorkerW窗口，我们必须向程序管理器发送一条消息。
  // 该消息是未记录的消息，因此没有专用的Windows API名称，除了0x052C
  let r = nw.SendMessageTimeoutW(
    progman,
    0x052c, // 在程序管理器上生成墙纸工作程序的未记录消息
    0,
    0,
    0x0000,
    1000,
    0
  );

  // 枚举所有窗口
  nw.EnumWindows((hwnd, lpParam) => {
    // 找到一个具有SHELLDLL_DefView的窗口
    const SHELLDLL_DefView = nw.FindWindowExA(hwnd, 0, "SHELLDLL_DefView", 0);
    if (SHELLDLL_DefView) {
      // 将其下一个同级分配给workerw。
      const workerw = nw.FindWindowExA(0, hwnd, "WorkerW", 0);
      // 设置窗口为未激活状态，否则这个窗口会遮挡视频
      nw.ShowWindow(workerw, 0);
      nw.SetParent(ffplayw, progman);
    }

    return 1;
  }, 0);
}
