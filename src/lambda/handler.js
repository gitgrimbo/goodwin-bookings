const Session = require("../Session");

function addCorsHeaders(headers = {}) {
  headers = {
    ...headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };
  return headers;
}

function errorResponse(err) {
  return {
    statusCode: 500,
    headers: addCorsHeaders(),
    body: JSON.stringify({
      error: err
        ? err.message || err.toString()
        : "There was an error"
    }),
  };
}

async function handle(promise) {
  try {
    return await promise;
  } catch (err) {
    return errorResponse(err);
  }
}

async function _getBookings(event, context) {
  const ENV_EMAIL = "sports_sheffield_email";
  const ENV_PASSWORD = "sports_sheffield_password";

  const session = new Session();

  const body = JSON.parse(event.body || "{}");

  const email = body.email || process.env[ENV_EMAIL];
  const password = body.password || process.env[ENV_PASSWORD];

  if (!email) {
    throw new Error(`email is required. either as request.body.email or as env var: "${ENV_EMAIL}"`);
  }

  if (!password) {
    throw new Error(`password is required. either as request.body.password or as env var: "${ENV_PASSWORD}"`);
  }

  const loginResult = await session.login(body.email || email, body.password || password);
  console.log(loginResult);

  const bookingsStr = await session.getBookings();
  try {
    const bookings = JSON.parse(bookingsStr);
    console.log(`Found ${bookings.length} bookings`);
  } catch (err) {
    throw new Error(`Could not parse bookings: "${(bookingsStr || "").substring(0, 100)}..."`);
  }

  return {
    statusCode: 200,
    headers: addCorsHeaders(),
    body: bookingsStr,
  };
};

async function getBookings(event, context) {
  return await handle(_getBookings(event, context));
}

async function logger(event, context) {
  console.log(event);
  console.log(context);

  return {
    statusCode: 200,
    headers: addCorsHeaders(),
    body: JSON.stringify(event),
  };
}

module.exports = {
  getBookings,
  logger,
};
