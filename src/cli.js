const {
  Session,
  ACTIVITY_CODES,
} = require("./Session");

function daysToMillis(days = 7) {
  return days * 24 * 60 * 60 * 1000;
}

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

  const session = Session.withRealTransport();

  const loginResult = await session.login(email, password);
  console.log(loginResult);

  const startMillis = Date.now();
  const endMillis = startMillis + daysToMillis(7);
  const bookings = await session.getBookings({
    activityCode: ACTIVITY_CODES.WEBSQ,
    startMillis,
    endMillis,
  });
  console.log(bookings);
}

(async () => {
  try {
    await main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
