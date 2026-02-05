# 🔬 PaddleOCR 测试与使用指南

## 📋 目录
1. [环境准备](#环境准备)
2. [快速测试](#快速测试)
3. [批量处理](#批量处理)
4. [常见问题](#常见问题)

---

## 🛠️ 环境准备

### 第一步:安装Python

**检查是否已安装**:
```bash
python --version
```

如果未安装,请:
1. 访问: https://www.python.org/downloads/
2. 下载Python 3.8或更高版本
3. 安装时**务必勾选** "Add Python to PATH"

### 第二步:安装PaddleOCR

```bash
pip install paddleocr
```

**如果pip较慢,可以使用国内镜像**:
```bash
pip install paddleocr -i https://pypi.tuna.tsinghua.edu.cn/simple
```

**验证安装**:
```bash
python -c "from paddleocr import PaddleOCR; print('安装成功!')"
```

---

## 🧪 快速测试

### 方式一:自动测试(推荐)

```bash
# 运行测试脚本
npm run ocr:test
```

这个脚本会:
1. ✅ 检查Python环境
2. ✅ 安装PaddleOCR
3. ✅ 下载测试图片
4. ✅ 运行OCR识别
5. ✅ 显示识别结果

### 方式二:手动测试

**1. 准备测试图片**
- 放一张图片到项目目录,命名为 `test-image.jpg`
- 或使用已有的小红书图片

**2. 运行Python脚本**
```bash
python batch_ocr.py test-image.jpg
```

**3. 查看结果**
会输出JSON格式的识别结果,包括:
- 每行文字内容
- 置信度
- 完整文本

---

## 📦 批量处理

### 处理所有笔记

```bash
# 处理所有77篇笔记
npm run ocr:all
```

### 分批处理

```bash
# 处理第1-10篇
npm run ocr:batch -- 0 10

# 处理第11-20篇
npm run ocr:batch -- 10 20

# 处理第20-30篇
npm run ocr:batch -- 20 30
```

### 处理流程

批量处理会:
1. 📥 下载每篇笔记的图片到 `data/images/`
2. 🔍 使用OCR识别每张图片
3. 💾 每5篇保存一次进度到 `data/ocr-results/`
4. 📊 生成包含OCR结果的JSON文件

---

## 📊 结果示例

### 识别结果格式

```json
{
  "image": "data/images/xxx_0.jpg",
  "texts": [
    {
      "text": "第一行文字",
      "confidence": 0.98
    },
    {
      "text": "第二行文字",
      "confidence": 0.95
    }
  ],
  "full_text": "第一行文字\n第二行文字",
  "line_count": 2,
  "char_count": 10
}
```

### 笔记数据更新

处理后,笔记数据会包含:
```json
{
  "id": "...",
  "title": "笔记标题",
  "content": "笔记正文",
  "images": ["图片1URL", "图片2URL"],
  "imageTexts": [
    {
      "index": 0,
      "url": "图片1URL",
      "text": "图片1识别的文字",
      "confidence": 0.98
    },
    {
      "index": 1,
      "url": "图片2URL",
      "text": "图片2识别的文字",
      "confidence": 0.95
    }
  ]
}
```

---

## ⚙️ 高级配置

### 调整OCR参数

编辑 `batch_ocr.py`:

```python
ocr = PaddleOCR(
    use_angle_cls=True,    # 是否使用方向分类器
    lang='ch',            # 语言: ch=中文, en=英文
    use_gpu=False,        # 是否使用GPU(如果有)
    show_log=False,       # 是否显示日志
    det_db_thresh=0.3,    # 检测阈值
    det_db_box_thresh=0.5 # 框选阈值
)
```

### 提高识别准确率

1. **图片预处理**:
   - 去噪
   - 调整对比度
   - 裁剪边距

2. **使用GPU加速**:
   ```python
   ocr = PaddleOCR(use_gpu=True)
   ```

3. **多次识别对比**:
   - 使用不同参数
   - 选择最佳结果

---

## 🆘 常见问题

### Q1: 安装PaddleOCR失败

**A**: 尝试以下方法:

```bash
# 方法1:升级pip
python -m pip install --upgrade pip

# 方法2:使用国内镜像
pip install paddleocr -i https://pypi.tuna.tsinghua.edu.cn/simple

# 方法3:分别安装依赖
pip install paddlepaddle
pip install paddleocr
```

### Q2: 识别效果不好

**A**: 可能的原因和解决方法:

1. **图片质量差** → 调整图片清晰度
2. **文字太小** → 放大图片
3. **字体特殊** → 更换OCR模型
4. **图片倾斜** → 启用 `use_angle_cls=True`

### Q3: 处理速度太慢

**A**: 优化方法:

1. **使用GPU**: 设置 `use_gpu=True`
2. **降低图片质量**: 缩小图片尺寸
3. **并发处理**: 同时处理多张图片
4. **分批处理**: 避免一次性处理太多

### Q4: 内存不足

**A**: 解决方法:

1. **分批处理**: 每次处理10-20篇
2. **关闭GPU**: 使用CPU模式
3. **清理缓存**: 定期删除临时图片

### Q5: 中文乱码

**A**: 确保设置:

```python
ocr = PaddleOCR(lang='ch')  # 明确指定中文
```

输出时使用:
```python
print(json.dumps(output, ensure_ascii=False))
```

---

## 📈 性能参考

**测试环境**: Intel i5, 8GB RAM, CPU模式

| 图片数量 | 分辨率 | 预计时间 |
|---------|--------|---------|
| 1张 | 1080p | 5-10秒 |
| 10张 | 1080p | 1-2分钟 |
| 50张 | 1080p | 5-10分钟 |
| 100张 | 1080p | 10-20分钟 |

**你的情况**:
- 77篇笔记
- 假设平均每篇5张图片 = 385张图片
- **预计总时间**: 30-60分钟

---

## 💡 优化建议

### 1. 智能跳过

有些图片不需要识别:
- 纯风景图
- 表情包
- 装饰性图片

添加判断逻辑:
```python
# 预检查图片是否包含文字
def has_text(image_path):
    # 使用快速检测
    pass
```

### 2. 增量处理

只处理新增的笔记:
```bash
# 从第20篇开始处理
npm run ocr:batch -- 20
```

### 3. 结果缓存

已识别的图片保存结果,避免重复:
```javascript
const cacheFile = 'ocr-cache.json';
// 读取和更新缓存
```

---

## 🎯 下一步

测试完成后:

1. **如果效果满意**:
   ```bash
   npm run ocr:all
   ```

2. **生成完整文档**:
   ```bash
   npm run doc:full
   ```

3. **查看Web界面**:
   ```bash
   npm run serve
   ```
   访问 http://localhost:8080

---

## 📞 需要帮助?

- **PaddleOCR文档**: https://github.com/PaddlePaddle/PaddleOCR
- **常见问题**: 查看 "常见问题" 部分
- **性能问题**: 查看 "优化建议" 部分

准备好了吗?运行 `npm run ocr:test` 开始测试! 🚀
