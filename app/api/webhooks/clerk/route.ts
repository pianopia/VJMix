import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/app/db';
import { users } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  // Webhookシークレットを取得
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // リクエストヘッダーを取得
  const headersList = headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  // 必要なヘッダーが存在するか確認
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  // リクエストボディを取得
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Webhookを検証
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }

  // イベントタイプに基づいて処理
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses } = evt.data;
    
    if (!id || !email_addresses || email_addresses.length === 0) {
      return new Response('Invalid user data', { status: 400 });
    }

    const primaryEmail = email_addresses[0].email_address;

    try {
      // ユーザーが存在するか確認
      const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);

      if (existingUser.length === 0) {
        // ユーザーが存在しない場合は作成
        await db.insert(users).values({
          id,
          email: primaryEmail,
        });
        console.log(`ユーザー ${id} を作成しました`);
      } else {
        // ユーザーが存在する場合は更新
        await db.update(users).set({ email: primaryEmail }).where(eq(users.id, id));
        console.log(`ユーザー ${id} を更新しました`);
      }
    } catch (error) {
      console.error('データベースエラー:', error);
      return new Response('データベースエラー', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
} 