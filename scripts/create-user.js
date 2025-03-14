require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');

// ユーザーIDとメールアドレスを引数から取得
const userId = process.argv[2];
const email = process.argv[3];

if (!userId || !email) {
  console.error('使用方法: node scripts/create-user.js <ユーザーID> <メールアドレス>');
  process.exit(1);
}

async function main() {
  // データベースクライアントの作成
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const db = drizzle(client);

  try {
    console.log('データベースに接続しています...');
    
    // ユーザーを作成するSQLを実行
    const sql = `
      INSERT INTO users (id, email, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
      email = excluded.email;
    `;
    
    await client.execute({
      sql,
      args: [userId, email]
    });
    
    console.log(`ユーザー ${userId} (${email}) を作成/更新しました！`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // 接続を閉じる
    await client.close();
  }
}

main(); 