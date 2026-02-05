# 免费 OCR 方案对比

## 🔥 推荐方案 (无需密钥)

### 1. EasyOCR ⭐ (推荐)

**优点**:
- ✅ 完全免费,开源
- ✅ 无需密钥,无需联网
- ✅ 支持中英文混合识别
- ✅ 安装简单: `pip install easyocr`
- ✅ 识别准确率较高

**缺点**:
- ⚠️ 首次运行会下载模型(约100MB)
- ⚠️ 速度较慢(CPU模式)

**安装**:
```bash
pip install easyocr
```

**使用**:
```bash
python scripts/easyocr-processor.py
```

---

### 2. Tesseract OCR

**优点**:
- ✅ 完全免费,开源
- ✅ 无需密钥,无需联网
- ✅ 老牌 OCR 引擎,稳定
- ✅ 支持多语言

**缺点**:
- ⚠️ 需要单独安装 Tesseract 程序
- ⚠️ 中文识别准确率一般
- ⚠️ 配置相对复杂

**安装**:
```bash
# 1. 安装 Python 库
pip install pytesseract pillow

# 2. 安装 Tesseract 程序
# Windows (推荐使用 Chocolatey):
choco install tesseract

# 或手动下载:
# https://github.com/UB-Mannheim/tesseract/wiki
```

**使用**:
```bash
python scripts/tesseract-ocr-processor.py
```

---

## 📊 方案对比

| 特性 | EasyOCR | Tesseract |
|------|---------|-----------|
| 安装难度 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 识别准确率 | ⭐⭐⭐⭐ 较高 | ⭐⭐⭐ 一般 |
| 识别速度 | ⭐⭐ 较慢 | ⭐⭐⭐ 较快 |
| 中文支持 | ⭐⭐⭐⭐ 好 | ⭐⭐⭐ 一般 |
| 内存占用 | ⭐⭐ 较高 | ⭐⭐⭐ 较低 |
| 是否需要密钥 | ❌ 否 | ❌ 否 |
| 是否需要联网 | ❌ 否 | ❌ 否 |

---

## 🎯 推荐选择

### 对于大多数用户: **EasyOCR**

- 安装最简单
- 识别准确率高
- 支持中英文混合

### 对于专业用户: **Tesseract**

- 可定制性强
- 有很多配置选项
- 社区支持好

---

## 🚀 快速开始

### 使用 EasyOCR (推荐)

1. **安装依赖**:
```bash
pip install easyocr
```

2. **运行脚本**:
```bash
# 测试模式: 只处理前 10 张图片
python scripts/easyocr-processor.py

# 处理所有图片 (修改脚本中的 max_images = None)
```

3. **查看结果**:
- Markdown: `docs/小红书笔记图片OCR识别-EasyOCR.md`
- JSON: `docs/小红书笔记图片OCR识别-EasyOCR.json`

---

## 💡 提示

1. **首次运行**: EasyOCR 会自动下载中文模型,需要等待几分钟

2. **GPU 加速**: 如果有 NVIDIA 显卡,可以启用 GPU 加速:
```python
reader = easyocr.Reader(['ch_sim', 'en'], gpu=True)
```

3. **批量处理**: 可以先测试几张图片,确认效果后再处理全部

4. **人工校对**: OCR 识别结果建议人工校对重要信息

---

**创建时间**: 2026-01-13
**推荐方案**: EasyOCR
