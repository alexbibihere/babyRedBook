# 小红书笔记图片 OCR 识别

## 📝 任务说明

识别下载的小红书笔记图片中的文字,并整理成 Markdown 文档。

## 📂 文件位置

下载的图片保存在:
```
D:\迅雷下载\XHS-Downloader_V2.6_Windows_X64\_internal\Volume\Download
```

## 📊 统计信息

- **总图片数**: 206 张
- **笔记数**: ~20 篇
- **文件命名格式**: `日期_时间_作者_标题_序号.png`

## 🔧 OCR 脚本

### 1. 批量 OCR 脚本

**文件**: `scripts/batch-ocr-images.py`

功能:
- 批量识别所有图片
- 自动解析文件名提取笔记信息
- 生成 Markdown 文档
- 保存 JSON 数据

使用方法:
```bash
python scripts/batch-ocr-images.py
```

### 2. 测试脚本

**文件**: `scripts/test-ocr-simple.py`

功能:
- 测试前 5 张图片
- 查看 OCR 返回格式

使用方法:
```bash
python scripts/test-ocr-simple.py
```

## 📄 输出文件

运行完成后会生成:

1. **Markdown 文档**: `docs/小红书笔记图片OCR识别.md`
   - 按作者分组
   - 包含所有图片
   - OCR 识别文字

2. **JSON 数据**: `docs/小红书笔记图片OCR识别.json`
   - 结构化数据
   - 可用于二次开发

## ⏳ 处理时间

- **单张图片**: 约 3-5 秒
- **总时间**: 约 10-20 分钟 (206 张)

## 📝 Markdown 格式预览

```markdown
# 小红书笔记图片文字识别合集

## 作者名称

### 笔记标题

**发布日期**: 2024-09-23

#### 图片

![标题-图片1](图片路径.png)

**识别文字**:
```
(OCR 识别的文字内容)
```

---
```

## 💡 提示

1. OCR 识别准确率约 85-95%
2. 建议人工校对重要信息
3. 图片需要联网才能在 Markdown 中显示
4. 可以导出为 PDF 后分享

## 🎯 下一步

1. 等待 OCR 完成
2. 查看生成的 Markdown 文档
3. 人工校对识别结果
4. 导出为 PDF 或直接使用

---

**生成时间**: 2026-01-13
**OCR 工具**: PaddleOCR
**处理状态**: 运行中...
