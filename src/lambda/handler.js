const {
  Session,
  ACTIVITY_CODES,
} = require("../Session");

function daysToMillis(days = 7) {
  return days * 24 * 60 * 60 * 1000;
}

function addCorsHeaders(headers = {}) {
  headers = {
    ...headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };
  return headers;
}

function errorResponse(err, payload) {
  const message = err
    ? err.message || err.toString()
    : "There was an error";
  return {
    statusCode: 500,
    headers: addCorsHeaders(),
    body: JSON.stringify({
      error: {
        message,
        payload: payload || err.data,
      },
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

  const session = Session.withRealTransport();

  const eventOb = typeof event === "string" ? JSON.parse(event) : event;
  const body = typeof eventOb.body === "string" ? JSON.parse(eventOb.body) : eventOb.body;

  const email = body.email || process.env[ENV_EMAIL];
  const password = body.password || process.env[ENV_PASSWORD];
  const activityCode = body.activityCode || ACTIVITY_CODES.WEBSQ;
  const groupslots = activityCode === ACTIVITY_CODES.SWPOOL;

  if (!email) {
    throw new Error(`email is required. either as request.body.email or as env var: "${ENV_EMAIL}"`);
  }

  if (!password) {
    throw new Error(`password is required. either as request.body.password or as env var: "${ENV_PASSWORD}"`);
  }

  const loginResult = await session.login(body.email || email, body.password || password);
  console.log(loginResult);

  const startMillis = Date.now();
  const endMillis = startMillis + daysToMillis(7);
  const bookings = await session.getBookings({
    activityCode,
    startMillis,
    endMillis,
    groupslots,
  });

  console.log(`Found ${bookings.length} bookings`);

  return {
    statusCode: 200,
    headers: addCorsHeaders(),
    body: JSON.stringify(bookings),
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
