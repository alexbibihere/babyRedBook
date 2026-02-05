# Umi-OCR 批量识别小红书图片 - 完整指南

## 📥 第一步：下载安装 Umi-OCR

### 下载地址
- **GitHub官方**: https://github.com/hiroi-sora/Umi-OCR/releases
- **推荐版本**: Umi-OCR_v1.3.3_Windows_x64_7z （或最新版本）

### 安装步骤
1. 下载压缩包（约200MB）
2. 解压到任意文件夹（如 `D:\Umi-OCR`）
3. 双击 `Umi-OCR.exe` 启动
4. 无需安装，开箱即用

## 🚀 第二步：批量识别图片

### 1. 启动软件
打开 Umi-OCR，点击 **"批量识别"** 标签

### 2. 导入图片文件夹
- 点击 **"添加文件"** 或 **"添加文件夹"**
- 选择您的图片目录：
  ```
  D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download
  ```
- 软件会自动扫描所有 `.png` 和 `.jpg` 文件（206张）

### 3. 开始识别
- 点击 **"开始识别"** 按钮
- 等待20-30分钟（比PaddleOCR快3-5倍）
- 可以实时看到识别进度和结果

## 📤 第三步：导出识别结果

### 导出格式选择
推荐导出为 **JSON格式**，方便后续处理：

1. 点击 **"导出结果"**
2. 选择 **"JSON文件"**
3. 保存为：`D:\github\babyRedBook\data\umi-ocr-result.json`

## 🔄 第四步：生成完整Markdown文档

导出JSON后，运行整合脚本：

```bash
python scripts/process-umi-ocr-result.py
```

这会生成：`docs/小红书笔记完整版-UmiOCR.md`

## 📊 处理时间对比

| 方案 | 处理206张图片 | 准确率 | 操作难度 |
|------|--------------|--------|----------|
| **Umi-OCR** | 20-30分钟 | 95%+ | 简单 |
| PaddleOCR | 90-120分钟 | 92% | 需要编程 |
| 腾讯云OCR | 5-10分钟 | 98% | 需要API |

## 🎯 Umi-OCR 优势总结

✅ 完全免费 - 无需任何费用
✅ 离线使用 - 不需要网络  
✅ 批量处理 - 一次处理206张
✅ 中文优化 - 专为中文设计
✅ 操作简单 - GUI界面，点点点就行
✅ 导出方便 - 支持JSON/Markdown/Excel
✅ 速度快 - 比PaddleOCR快3-5倍
✅ 准确率高 - 文字识别准确率95%+

---

**下一步操作**：
1. 下载并安装 Umi-OCR
2. 批量识别您的206张图片
3. 导出JSON文件
4. 告诉我已完成，我会帮您生成最终的Markdown文档
