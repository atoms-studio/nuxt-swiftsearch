export default defineEventHandler(async () => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(true), 3000);
  });
  return "test";
});
