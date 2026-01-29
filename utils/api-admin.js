import fs from 'fs';
import { request } from '@playwright/test';

export async function getAdminApiContext() {
  const { token } = JSON.parse(
    fs.readFileSync('admin-token.json', 'utf-8')
  );

  return await request.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}