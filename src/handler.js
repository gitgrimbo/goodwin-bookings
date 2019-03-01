const Session = require("./index");

async function getBookings(event, context) {
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

  const bookingsStr = await session.getBookings();
  try {
    const bookings = JSON.parse(bookingsStr);
    console.log(`Found ${bookings.length} bookings`);
  } catch (err) {
    console.error(`Could not parse bookings: "${(bookingsStr || "").substring(0, 100)}..."`);
  }

  return {
    statusCode: 200,
    body: bookingsStr,
  };
};

module.exports = {
  getBookings,
};
