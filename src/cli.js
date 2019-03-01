const Session = require("./index");

async function main() {
  const ENV_EMAIL = "sports_sheffield_email";
  const ENV_PASSWORD = "sports_sheffield_password";

  const email = process.env[ENV_EMAIL];
  if (!email) {
    throw new Error(`Need env var: "${ENV_EMAIL}"`);
  }

  const password = process.env[ENV_PASSWORD];
  if (!password) {
    throw new Error(`Need env var: "${ENV_PASSWORD}"`);
  }

  const session = new Session();

  const loginResult = await session.login(email, password);
  console.log(loginResult);

  const bookings = await session.getBookings();
  console.log(bookings);
}

(async () => {
  try {
    await main();
    await main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
