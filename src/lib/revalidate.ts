export async function triggerRevalidation() {
  try {
    await fetch('/api/revalidate', { method: 'POST' });
  } catch (err) {
    console.error('Revalidation trigger error:', err);
  }
}
