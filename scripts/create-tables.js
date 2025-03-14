require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function main() {
  // データベースクライアントの作成
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log('データベースに接続しています...');
    
    // SQLファイルの読み込み
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    
    // SQLステートメントを分割
    const statements = schemaSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // 各ステートメントを順番に実行
    console.log('テーブルを作成しています...');
    for (const statement of statements) {
      await client.execute(statement + ';');
      console.log('- SQLステートメントを実行しました');
    }
    
    console.log('テーブルの作成が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // 接続を閉じる
    await client.close();
  }
}

main(); 