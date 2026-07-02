export async function openRemoteDocument(url, fileName) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}
