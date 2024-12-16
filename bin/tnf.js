#!/usr/bin/env node

// patch console for debug
// ref: https://remysharp.com/2014/05/23/where-is-that-console-log
if (process.env.DEBUG_CONSOLE) {
  ['log', 'warn', 'error'].forEach((method) => {
    const old = console[method];
    console[method] = function () {
      let stack = new Error().stack.split(/\n/);
      // Chrome includes a single "Error" line, FF doesn't.
      if (stack[0].indexOf('Error') === 0) {
        stack = stack.slice(1);
      }
      const args = [].slice.apply(arguments).concat([stack[1].trim()]);
      return old.apply(console, args);
    };
  });
}
// 这段代码的主要功能是：
// a. 环境检查：
// 只在设置了 DEBUG_CONSOLE 环境变量时启用
// 这是一个条件性的调试增强功能
// b. 控制台方法增强：
// 修改了三个主要的控制台方法：log、warn、error
// 使用函数装饰器模式保存原始方法 
// c. 堆栈跟踪功能：
// 创建新的 Error 对象获取堆栈信息
// 分割堆栈字符串为数组
// 处理不同浏览器的堆栈差异（Chrome vs Firefox）
// d. 参数处理：
// 使用 slice.apply 转换参数为数组
// 在原始日志信息后添加调用位置信息

// 加载编译后的 CLI 主程序
require('../dist/cli');

// # 启用调试增强
// DEBUG_CONSOLE=1 node your-script.js

// # 正常输出
// console.log('Hello');  // Hello

// # 增强后的输出（包含调用位置）
// console.log('Hello');  // Hello at /path/to/file.js:10:20

// 第一行是：Shebang 声明；这是一个 Unix 系统的 shebang 声明，告诉系统使用 node 来执行这个文件，使脚本可以直接在命令行中执行


// 调试增强的作用：
// 提供更多上下文
// 非侵入性：只在需要时启用（通过环境变量）
// 兼容性：只在需要时启用（通过环境变量）
// 扩展性：可以轻松扩展到其他控制台方法
// 这种调试增强对于开发大型 Node.js 应用特别有用，可以帮助开发者：
// 快速定位日志来源
// 追踪程序执行流程
// 简化调试过程