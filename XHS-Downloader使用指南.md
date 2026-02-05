# 🚀 XHS-Downloader 快速使用指南

## 📦 下载和安装

### 方法一:直接下载可执行文件(推荐)

1. **访问Releases页面**:
   - GitHub: https://github.com/JoeanAmier/XHS-Downloader/releases
   - 找到最新版本(v1.8.0或更高)

2. **下载对应系统版本**:
   - Windows: 下载 `XHS-Downloader-win-x64-vX.X.X.zip`
   - macOS: 下载 `XHS-Downloader-mac-x64-vX.X.X.zip`

3. **解压使用**:
   - 解压到任意目录
   - 双击 `main.exe`(Windows) 或 `main`(macOS) 运行

### 方法二:从源码运行

```bash
# 1. 克隆项目
git clone https://github.com/JoeanAmier/XHS-Downloader.git
cd XHS-Downloader

# 2. 安装Python依赖
pip install -r requirements.txt

# 3. 运行
python main.py
```

---

## 🎯 使用方法

### 下载单个笔记

1. **获取链接**:
   - 在小红书App或网页打开笔记
   - 点击"分享" → "复制链接"

2. **粘贴链接**:
   - 打开XHS-Downloader
   - 点击"从剪贴板读取"按钮
   - 或手动粘贴链接到输入框

3. **开始下载**:
   - 选择保存位置
   - 点击"下载"按钮
   - 等待完成

### 批量下载多个笔记

1. **准备链接列表**:
   - 创建一个txt文件
   - 每行一个小红书链接

2. **批量导入**:
   - 点击"批量导入"按钮
   - 选择txt文件
   - 点击"全部下载"

### 下载用户所有笔记

1. **获取用户主页链接**:
   - 访问用户主页
   - 复制URL(例如: https://www.xiaohongshu.com/user/profile/XXXXX)

2. **输入链接**:
   - 粘贴到XHS-Downloader
   - 选择"下载用户作品"
   - 设置下载数量
   - 点击开始

---

## 📋 你的使用场景

### 场景一:下载你自己的77篇笔记

**方法A:使用链接列表**

1. **生成链接列表**:
   ```bash
   # 在项目目录运行
   node -e "const fs=require('fs'); const notes=JSON.parse(fs.readFileSync('data/notes.json','utf-8')); notes.forEach(n=>console.log(n.url));" > notes_links.txt
   ```

2. **使用XHS-Downloader批量下载**:
   - 打开XHS-Downloader
   - 点击"批量导入"
   - 选择 `notes_links.txt`
   - 点击"全部下载"

**方法B:逐个下载**

1. 打开 `data/notes.json`
2. 复制链接列表
3. 在XHS-Downloader中批量粘贴
4. 点击下载

---

## 💾 数据导出

XHS-Downloader支持导出为:
- ✅ SQLite数据库(默认)
- ✅ JSON格式
- ✅ Excel格式(需要配置)

导出位置:
- Windows: `C:\Users\你的用户名\.xhs-downloader\`
- macOS: `~/.xhs-downloader/`

---

## ⚙️ 配置说明

### 主要配置项

在 `config.yaml` 或设置界面中:

```yaml
# 下载设置
download:
  # 保存路径
  save_path: "D:/小红书下载"

  # 文件命名
  naming: "{title}_{create_time}"

  # 下载内容
  download_image: true  # 下载图片
  download_video: true  # 下载视频
  download_text: true   # 下载文本

# 账号设置(可选)
account:
  cookie: ""  # 填入你的Cookie可以下载需要登录的内容
```

---

## 🔑 获取Cookie(可选)

如果需要下载私密内容:

1. **打开小红书网页版**:
   - 访问 https://www.xiaohongshu.com
   - 登录你的账号

2. **获取Cookie**:
   - 按F12打开开发者工具
   - 切换到"Network"(网络)标签
   - 刷新页面
   - 找到任意请求
   - 在"Headers"中找到"Cookie"
   - 复制完整的Cookie值

3. **配置Cookie**:
   - 粘贴到XHS-Downloader的设置中
   - 保存配置

---

## 💡 提示和技巧

### 1. 提高下载速度

- 使用代理IP池
- 减少并发下载数
- 避开高峰时段

### 2. 避免被封

- 设置合理的延迟(2-5秒)
- 不要一次下载太多(建议每批20-50篇)
- 使用Cookie保持登录状态

### 3. 数据整理

下载完成后,可以使用我为你创建的工具:

```bash
# 生成Web展示
npm run serve

# 生成完整文档
npm run doc:full
```

---

## 🆘 常见问题

**Q: 下载失败?**
A: 检查网络连接,或尝试使用Cookie

**Q: 速度很慢?**
A: 减少并发数,或使用代理

**Q: 如何批量处理?**
A: 创建txt文件,每行一个链接

**Q: 下载的文件在哪里?**
A: 默认在软件目录的"downloads"文件夹

---

## 📊 整合到当前项目

下载完成后:

1. **提取文本内容**:
   - XHS-Downloader会自动保存文本到数据库
   - 导出为JSON格式
   - 复制到 `data/notes.json`

2. **生成文档**:
   ```bash
   npm run doc:full
   ```

3. **Web展示**:
   ```bash
   npm run serve
   ```
   访问 http://localhost:8080

---

## 🔗 相关链接

- **GitHub**: https://github.com/JoeanAmier/XHS-Downloader
- **Releases**: https://github.com/JoeanAmier/XHS-Downloader/releases
- **使用教程**: https://blog.csdn.net/gitblog_00303/article/details/141016462
- **视频教程**: https://www.bilibili.com/read/mobile?id=33189470
