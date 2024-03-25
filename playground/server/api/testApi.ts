export default defineEventHandler(async () => {
  return await new Promise((resolve) => {
    setTimeout(() => resolve(true), 500);
  });
});
