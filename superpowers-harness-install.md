# DeepSeek Harness 安装 Superpowers

交付包：`E:\company-apps\superpowers-7.0.0-harness.zip`

来源：`https://github.com/obra/superpowers`（官方仓库 `main` 分支）

版本：`7.0.0`

SHA-256：`02DBD1DF4D736AA8F6016C5E163AD613A1FFEEA0D58DEF158E12AACD4A6A41D8`

## 搭建同事安装步骤

1. 把 `superpowers-7.0.0-harness.zip` 复制到员工电脑。
2. 在 PowerShell 中校验文件（可选但建议）：

   ```powershell
   Get-FileHash .\superpowers-7.0.0-harness.zip -Algorithm SHA256
   ```

   输出应为上面的 SHA-256。

3. 解压到一个固定目录，例如：

   ```powershell
   Expand-Archive .\superpowers-7.0.0-harness.zip -DestinationPath "$env:USERPROFILE\\superpowers"
   ```

   解压后插件根目录是 `superpowers-main`，其中必须保留 `skills`、`.claude-plugin`、`.codex-plugin` 等目录。

4. 在 DeepSeek Harness 的插件管理器中选择“从本地目录/本地插件安装”，选择解压后的：

   ```text
   %USERPROFILE%\superpowers\superpowers-main
   ```

   如果 Harness 接受本地压缩包，也可以直接选择 `superpowers-7.0.0-harness.zip`。

5. 安装后重启 Harness，并新建会话。用下面的提示验证：

   ```text
   Let's make a react todo list
   ```

   正常情况下，在开始写代码前会先触发 `brainstorming` 工作流。

## 重要说明

- 该压缩包是官方完整源码包，不是手工复制的单个 skill 文件。
- 当前没有在本机验证 DeepSeek Harness 的具体插件命令或版本；如果 Harness 不识别本地目录，请把 Harness 的“插件安装”界面截图或准确版本号发回，我再补充对应命令。
- 安装后应启动新会话；已经运行的会话可能不会重新加载插件。
