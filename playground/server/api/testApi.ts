export default defineEventHandler(async () => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(true), 2000);
  });
  return "test";
});
