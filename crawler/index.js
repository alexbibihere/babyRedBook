import XHSWebScraper from './web-scraper.js';

/**
 * 小红书笔记收集器主程序
 * 用于爬取和整理用户的笔记、收藏和点赞内容
 */

// 从环境变量或直接使用配置
const USER_ID = process.env.XHS_USER_ID || '7410657861';
const COOKIE = process.env.XHS_COOKIE || 'abRequestId=3c981118-53ae-5e19-9901-f1061f2c8543; webBuild=5.6.5; a1=19babeef4c5hafsqrjffc5u4kr48f4jynu5mcmlat50000188558; webId=27f035e2670c84bbcda25edb4cf1ecd6; gid=yjD0Ddi8KWI4yjD0Dddi4761S2x0iMAFViiS209274TF4628Yi4VvS888yYY22Y8K4S2822q; web_session=040069b547c8036e20f6c707563b4b8e48303f; id_token=VjEAAPpfJpHF8z7ZGLrhIUVkUVE4j2lv1PwM4g2PEB6mgKolD4tGubZZTdWdo0Pf+GYTAV2at8ZgwLdYJfU0Z5C6xCUqiBiRH8njcuSS2aVRod9KYSO/ihZKfSd4KgEevhk/0sSb; unread={%22ub%22:%2269591862000000001e009ede%22%2C%22ue%22:%226963014d000000000c035e0b%22%2C%22uc%22:33}; xsecappid=xhs-pc-web; loadts=1768117458647; acw_tc=0ad5870a17681179425013012e39f4d5d969d37d2cfc8101b1a79840ea21c5; websectiga=8886be45f388a1ee7bf611a69f3e174cae48f1ea02c0f8ec3256031b8be9c7ee; sec_poison_id=352095cf-f3db-43a4-b031-afcf5fe12908';

async function main() {
  console.log('🎨 小红书笔记收集器启动\n');
  console.log(`👤 用户ID: ${USER_ID}\n`);

  const scraper = new XHSWebScraper(USER_ID, COOKIE);

  try {
    // 启动浏览器
    await scraper.launchBrowser();

    // 获取笔记数据
    const notes = await scraper.scrapeUserNotes();

    // 保存数据
    scraper.saveData(notes);

    console.log('\n✅ 数据收集完成！');
    console.log('\n📝 下一步:');
    console.log('在浏览器中打开 index.html 查看你的笔记集合\n');

  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    console.log('\n💡 提示:');
    console.log('1. 检查网络连接');
    console.log('2. 确认Cookie是否有效(Cookie可能过期)');
    console.log('3. 确认用户ID是否正确');
    console.log('4. 也可以使用示例数据: npm run import:sample\n');
  } finally {
    await scraper.close();
  }
}

// 运行主程序
main().catch(console.error);
