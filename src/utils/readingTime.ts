export function calculateReadingTime(text: string): { minutes: number; text: string } {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return {
    minutes,
    text: `${minutes} min read`
  };
}
