# 灯塔 Demo/API 基线部署

本目录是待执行的部署配置，文件存在不代表服务器已经部署。
用户已指定共享 ECS `39.105.54.62`、宝塔现有 Nginx 和域名 `lh.qlf3.com`。
镇安使用 3000；灯塔计划仅监听 `127.0.0.1:3100`，不新增 Nginx 实例。

## 隔离布局

- 发布目录：`/opt/lighthouse-corpus/releases/<release>`，软链接 `current` 指向当前版本。
- 服务：`lighthouse-corpus.service`，系统账号 `lighthouse`，禁止交互登录。
- 环境文件：`/etc/lighthouse-corpus/app.env`，root 持有，权限 600；systemd 读取后传入服务。
- 数据库：现有 PostgreSQL 实例内新建 `lighthouse_corpus`，所有者 `lighthouse_owner` 不允许登录；应用使用受限的 `lighthouse_app`。
- 应用账号审计表仅 SELECT/INSERT；不授予 UPDATE/DELETE/TRUNCATE，迁移登记仅只读。
- API 与静态 Demo 共用 HTTPS 域名。页面明确显示模拟数据；没有真实工作台、飞书或网盘功能。
- 当前项目没有构建命令；使用保存在项目目录中的 JS/HTML 源文件。部署时运行锁文件依赖安装、Node 测试与语法检查。

## 执行顺序与证据

1. 检查端口、服务、Nginx 实际可执行文件和配置、镇安当前状态；不要执行 `/usr/sbin/nginx`。
2. 备份当前灯塔软链接/服务/站点配置（若存在），同时保存镇安与宝塔配置的哈希，记录原 Nginx 主进程 PID。
3. 上传 `Build-Package.ps1` 生成的包并核对 SHA-256，解压到新发布目录，不覆盖旧版。
4. 在发布目录的 `server/` 执行 `npm ci --omit=dev --no-audit --no-fund`、`node --test test/*.test.js` 和两个 Demo 语法检查。
5. `python3 deploy/bootstrap-db.py` 仅用于首次创建独立数据库；若环境文件、数据库或角色已存在则拒绝覆盖。该脚本在服务器生成密码并执行 `127.0.0.1` TCP 认证验证。
6. 先执行 `python3 deploy/migrate.py --dry-run`，然后备份独立库，再执行不带参数的迁移。每次迁移为单事务并登记版本和 SHA-256。
7. 安装服务、设置 `current` 链接；启动前用 `check-db.js` 验证独立数据库、迁移哈希、审计权限。不会把 Demo 数据写入数据库。
8. 安装仅灯塔域名的 HTTP 配置；使用 `/www/server/nginx/sbin/nginx -t -c /www/server/nginx/conf/nginx.conf` 测试，再对该 Nginx 平滑 reload。
9. 使用已存在 ACME 账号和 webroot 签发灯塔证书，不采用 standalone、不停 80/443。若新条款需接受，先由用户确认；不自动代为接受新协议。
10. 换为 HTTPS 配置并测试、平滑 reload；验证 80→HTTPS、HTTPS 首页/API、服务目录、环境已加载、数据库和日志，并复核镇安。

## 可执行回滚

以下命令只作用于灯塔。执行前先根据实际备份记录核对目录和文件。

当前尚未核验任何已部署的灯塔旧版本；以下是待现场替换路径、验证后执行的模板，不是已完成的回滚演练。

只有前后两个版本的迁移文件名和 SHA-256 完全相同，才允许直接切回旧代码。`check-db.js` 保持严格检查；不能为了切旧版本而跳过它。以下命令使用 Bash，由 root 执行，先将两个占位目录替换成实际保留的版本和备份：

```bash
set -eu
lighthouse_root=/opt/lighthouse-corpus
lighthouse_previous=$(readlink -e "$lighthouse_root/releases/PREVIOUS_RELEASE")
lighthouse_backup=$(readlink -e "$lighthouse_root/backups/BACKUP")
lighthouse_current=$(readlink -e "$lighthouse_root/current")
case "$lighthouse_previous" in "$lighthouse_root"/releases/*) ;; *) exit 1 ;; esac
case "$lighthouse_current" in "$lighthouse_root"/releases/*) ;; *) exit 1 ;; esac
case "$lighthouse_backup" in "$lighthouse_root"/backups/*) ;; *) exit 1 ;; esac
test -d "$lighthouse_previous/server/migrations"
test -f "$lighthouse_backup/lighthouse-corpus.service"
test -f "$lighthouse_backup/lh.qlf3.com.conf"

# 文件清单或校验和不同就停止，不能切换链接。
diff -u <(cd "$lighthouse_current/server/migrations"; sha256sum -- *.sql) \
        <(cd "$lighthouse_previous/server/migrations"; sha256sum -- *.sql)
# 再对实际独立数据库执行事务预检；失败时 set -e 会在变更之前退出。
python3 "$lighthouse_previous/deploy/migrate.py" --dry-run

ln -sfn "$lighthouse_previous" "$lighthouse_root/current"
cp "$lighthouse_backup/lighthouse-corpus.service" /etc/systemd/system/lighthouse-corpus.service
cp "$lighthouse_backup/lh.qlf3.com.conf" /www/server/panel/vhost/nginx/lh.qlf3.com.conf
systemctl daemon-reload
systemctl restart lighthouse-corpus.service
/www/server/nginx/sbin/nginx -t -c /www/server/nginx/conf/nginx.conf && /www/server/nginx/sbin/nginx -s reload -c /www/server/nginx/conf/nginx.conf
```

若新迁移已经提交且清单不同，上面的直接切回流程不适用。必须先在另一个独立数据库验证备份恢复、旧版兼容性和切换步骤，或交付经过验证的前向修复；在此之前保留现场，不重启旧版、不修改迁移登记、不自动降级数据库。以后包含 schema 变更的发布，必须先准备该版本专用的恢复方案。

首次上线撤回时（保留源码、数据库、环境文件、证书和日志）：

```sh
systemctl disable --now lighthouse-corpus.service
mv /www/server/panel/vhost/nginx/lh.qlf3.com.conf /opt/lighthouse-corpus/backups/lh.qlf3.com.conf.withdrawn
/www/server/nginx/sbin/nginx -t -c /www/server/nginx/conf/nginx.conf && /www/server/nginx/sbin/nginx -s reload -c /www/server/nginx/conf/nginx.conf
```

不自动执行 DROP DATABASE、DROP ROLE 或删除表。新增库迁移失败时事务回滚；若将来需要恢复备份，先恢复到另一个独立数据库核对，再由操作者决定切换。不得恢复或修改镇安数据库。
