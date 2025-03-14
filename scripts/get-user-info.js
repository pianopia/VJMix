require('dotenv').config({ path: '.env.local' });
const { Clerk } = require('@clerk/clerk-sdk-node');

// Clerkクライアントの初期化
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  try {
    // 全ユーザーを取得
    const users = await clerk.users.getUserList();
    
    console.log('ユーザー一覧:');
    users.forEach(user => {
      const primaryEmail = user.emailAddresses[0]?.emailAddress || 'メールアドレスなし';
      console.log(`ID: ${user.id}, メール: ${primaryEmail}`);
    });
    
    console.log('\nこのIDとメールアドレスを使用して以下のコマンドを実行してください:');
    console.log('npm run db:create-user <ユーザーID> <メールアドレス>');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

main(); 