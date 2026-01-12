import fs from 'fs';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * PaddleOCR 测试脚本
 * 用于测试图片文字识别效果
 */

class OCRTester {
    constructor() {
        this.testImages = [
            // 测试图片URL列表
            'https://sns-webpic-qc.xhscdn.com/202601111638/ddd2e6fb78651d2c65132f9a9e52f036/1040g0083183gn8q0go005p9j7caqo9l8dau6cs8!nc_n_webp_mw_1'
        ];
    }

    // 检查Python环境
    async checkPython() {
        console.log('🔍 检查Python环境...\n');

        try {
            const { stdout } = await execAsync('python --version');
            console.log('✅ Python已安装:', stdout.trim());
            return true;
        } catch (error) {
            console.log('❌ Python未安装');
            console.log('\n请安装Python 3.8+:');
            console.log('1. 访问: https://www.python.org/downloads/');
            console.log('2. 下载并安装Python 3.8或更高版本');
            console.log('3. 安装时勾选 "Add Python to PATH"\n');
            return false;
        }
    }

    // 安装PaddleOCR
    async installPaddleOCR() {
        console.log('📦 安装PaddleOCR...\n');

        try {
            // 安装paddleocr
            console.log('执行: pip install paddleocr');
            await execAsync('pip install paddleocr');
            console.log('✅ PaddleOCR安装成功\n');

            return true;
        } catch (error) {
            console.log('❌ 安装失败:', error.message);
            console.log('\n请手动执行:');
            console.log('pip install paddleocr\n');
            return false;
        }
    }

    // 下载测试图片
    async downloadImage(url, filepath) {
        console.log(`📥 下载图片: ${url}\n`);

        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
                timeout: 30000
            });

            const writer = fs.createWriteStream(filepath);

            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on('finish', () => {
                    console.log('✅ 图片下载成功\n');
                    resolve(filepath);
                });
                writer.on('error', reject);
            });
        } catch (error) {
            console.log('❌ 下载失败:', error.message);
            throw error;
        }
    }

    // 创建OCR测试脚本
    createOCRScript() {
        const script = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from paddleocr import PaddleOCR
import sys
import json

# 初始化OCR
ocr = PaddleOCR(use_angle_cls=True, lang='ch')

# 读取图片路径
image_path = sys.argv[1]

# 执行识别
result = ocr.ocr(image_path, cls=True)

# 提取文字
texts = []
if result and result[0]:
    for line in result[0]:
        text = line[1][0]
        confidence = line[1][1]
        texts.append({
            'text': text,
            'confidence': confidence
        })

# 输出结果
output = {
    'image': image_path,
    'texts': texts,
    'full_text': '\\n'.join([t['text'] for t in texts])
}

print(json.dumps(output, ensure_ascii=False, indent=2))
`;

        fs.writeFileSync('test_ocr.py', script);
        console.log('✅ OCR测试脚本已创建: test_ocr.py\n');
    }

    // 运行OCR测试
    async runOCR(imagePath) {
        console.log('🔍 开始OCR识别...\n');

        try {
            const { stdout, stderr } = await execAsync(`python test_ocr.py "${imagePath}"`);

            if (stderr) {
                console.log('警告:', stderr);
            }

            // 解析结果
            const result = JSON.parse(stdout);

            console.log('═══════════════════════════════════════');
            console.log('✅ OCR识别完成!');
            console.log('═══════════════════════════════════════\n');
            console.log('📝 识别到的文字:\n');
            console.log(result.full_text);
            console.log('\n═══════════════════════════════════════\n');
            console.log(`📊 统计:`);
            console.log(`   - 文本行数: ${result.texts.length}`);
            console.log(`   - 总字符数: ${result.full_text.length}\n`);

            return result;
        } catch (error) {
            console.log('❌ OCR识别失败:', error.message);
            throw error;
        }
    }

    // 完整测试流程
    async test() {
        console.log('\n═══════════════════════════════════════');
        console.log('🚀 PaddleOCR 测试程序');
        console.log('═══════════════════════════════════════\n');

        // 检查Python
        const hasPython = await this.checkPython();
        if (!hasPython) {
            return;
        }

        // 安装PaddleOCR
        console.log('检查PaddleOCR是否已安装...\n');
        const installed = await this.installPaddleOCR();
        if (!installed) {
            return;
        }

        // 创建OCR脚本
        this.createOCRScript();

        // 使用本地测试图片或下载
        const testImagePath = 'test-image.jpg';

        if (fs.existsSync(testImagePath)) {
            console.log('使用本地测试图片:', testImagePath, '\n');
        } else {
            console.log('下载测试图片...\n');
            try {
                await this.downloadImage(this.testImages[0], testImagePath);
            } catch (error) {
                console.log('⚠️  无法下载测试图片');
                console.log('请手动放置一张测试图片,命名为: test-image.jpg\n');
                console.log('然后重新运行: npm run test:ocr\n');
                return;
            }
        }

        // 运行OCR
        await this.runOCR(testImagePath);

        console.log('═══════════════════════════════════════');
        console.log('✅ 测试完成!');
        console.log('═══════════════════════════════════════\n');
        console.log('💡 后续步骤:');
        console.log('1. 查看识别效果是否满意');
        console.log('2. 如果满意,运行: npm run ocr:all');
        console.log('3. 如果不满意,可以尝试调整OCR参数\n');
    }
}

// 运行测试
const tester = new OCRTester();
tester.test().catch(console.error);
