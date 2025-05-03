// This is a simplified example. In a real app, you'd use a database.
// For now, we'll use an in-memory store

const tokenStore: Record<number, { token: string, url: string }> = {};

export async function saveNotificationToken({ 
  fid, 
  token, 
  url 
}: { 
  fid: number, 
  token: string, 
  url: string 
}) {
  tokenStore[fid] = { token, url };
  console.log(`Saved notification token for FID ${fid}`);
  return true;
}

export async function removeNotificationToken(fid: number) {
  delete tokenStore[fid];
  console.log(`Removed notification token for FID ${fid}`);
  return true;
}

export async function getNotificationDetails(fid: number) {
  return tokenStore[fid];
}

