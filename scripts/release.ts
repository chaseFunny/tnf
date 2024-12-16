// 断言检测
import assert from 'assert';
// 获取 git 仓库信息
import getGitRepoInfo from 'git-repo-info';
// 一个用于编写更好的 shell 脚本的库
import 'zx/globals';

(async () => {
  // 获取当前 git 分支信息
  const { branch } = getGitRepoInfo();

  console.log('pnpm install');
  // 安装依赖
  await $`pnpm install`;

  console.log('git status');
  // git 状态检查，检查 git 工作区是否干净
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  // 断言，如果 git 工作区不干净，则抛出错误
  assert(!isGitClean, 'git status is not clean');

  console.log('build');
  // 构建
  await $`npm run build`;

  console.log('doctor');
  // 项目健康检查
  await $`father doctor`;
  // 版本管理
  console.log('bump version');
  // const currentVersion = require('../package.json').version;
  // console.log('current version', currentVersion);
  // const version = await question('Enter the new version: ');
  // 获取 package.json 中的版本号
  const pkg = require('../package.json');
  const version = pkg.version;
  // 交互式询问新版本号
// 更新 package.json 中的版本号
  // pkg.version = version;
  // fs.writeFileSync(
  //   path.join(__dirname, '../package.json'),
  //   JSON.stringify(pkg, null, 2) + '\n',
  // );

  console.log('update templates');
  const templateDir = path.join(__dirname, '../create-tnf/templates');
  const templateDirs = fs
    .readdirSync(templateDir)
    .filter((dir) => fs.statSync(path.join(templateDir, dir)).isDirectory());
  for (const dir of templateDirs) {
    const pkgPath = path.join(templateDir, dir, 'package.json');
    const content = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    pkg.dependencies['@umijs/tnf'] = `^${version}`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
  // 提交所有更改
  console.log('commit & tag');
  await $`git commit --all --message "release: ${version}" -n`;
  // 创建版本标签
  await $`git tag ${version}`;
// 发布操作
  console.log('publish');
  let tag = 'latest';
  // 根据版本号确定发布标签（latest 或 next）
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    tag = 'next';
  }
  // 发布到 npm
  await $`npm publish --tag ${tag}`;

  // TODO: remove this after the official release
  console.log('add dist-tag temporary');
  // 该代码使用 npm 的 dist-tag 命令为 @umijs/tnf 包添加一个标签，标签名为 latest，版本为 ${version}。这意味着当用户安装 @umijs/tnf 包时，默认会安装 latest 标签对应的版本。
  await $`npm dist-tag add @umijs/tnf@${version} latest`;

  console.log('git push');
  // 推送到远程仓库
  await $`git push origin ${branch} --tags`;

  console.log('release success');
})().catch((err) => {
  // 捕获错误并打印错误信息
  console.error(err);
  // 退出进程
  process.exit(1);
});


// 这个脚本遵循了 Node.js 发布的最佳实践 ，包括：
// 版本控制
// 自动化构建
// 测试检查
// npm 发布
// Git 标签管理
// 使用这个脚本可以：

// 确保发布过程的一致性
// 减少人为错误
// 自动化繁琐的发布步骤
// 支持不同类型的版本发布（正式版和预发布版）
// 这是一个相当完善的发布自动化脚本，适合用于 Node.js 项目的版本发布管理