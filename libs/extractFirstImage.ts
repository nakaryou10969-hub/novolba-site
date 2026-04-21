/**
 * HTML 文字列から最初の <img> タグの src を抽出する。
 * アイキャッチが未設定の記事でサムネイルとして使用する。
 */
export function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
