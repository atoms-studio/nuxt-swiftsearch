export default defineEventHandler(async () => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(true), 200);
  });
  return "test";
});
