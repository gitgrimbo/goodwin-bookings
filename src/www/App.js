import React from "react";
import Bookings from "./Bookings";
import ErrorWidget from "./ErrorWidget";
import AsyncButton from "./AsyncButton";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchJson = async (endpoint, opts) => {
  opts = opts || {};
  const resp = await fetch(endpoint, opts);
  const text = await resp.text();
  let json = null;

  try {
    json = JSON.parse(text);
  } catch (err) {
    const e = new Error(`Could not parse JSON: response.body=${text}, for endpoint=${endpoint}`);
    e.httpStatus = resp.status;
    throw e;
  }

  if (typeof json.error === "undefined") {
    return json;
  }

  // treat as error
  if (typeof json.error === "string") {
    const e = new Error(`error=${json.error}, for endpoint=${endpoint}`);
    e.httpStatus = resp.status;
    throw e;
  } else {
    const { message, payload } = json.error;
    const e = new Error(`error=${message}, for endpoint=${endpoint}`);
    e.data = payload;
    e.httpStatus = resp.status;
    throw e;
  }
};

const useFetchJson = (endpoint, opts) => {
  opts = opts || {};

  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const [fetchError, setFetchError] = React.useState(null);

  // pass empty array to useEffect - i.e. run once.
  const fetch = async () => {
    try {
      setLoading(true);
      setValue(await fetchJson(endpoint, opts));
      setFetchError(false);
    } catch (err) {
      setFetchError(err);
    }
    setLoading(false);
  };

  return {
    fetch,
    value,
    error: fetchError,
    loading,
  };
}

function App({
  dev = false,
}) {
  const prodEndpoint = "https://1e53hmg02i.execute-api.eu-west-2.amazonaws.com/prod/getBookings";

  const sampleEndpoints = [
    "./sample-responses/unpaid-invoices.json",
    "./sample-responses/squash.json",
  ];

  const bookingsEndpoint = dev ? sampleEndpoints[0] : prodEndpoint;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const opts = dev
    ? {
      method: "GET",
    }
    : {
      mode: "cors",
      method: "POST",
      body: JSON.stringify({
        email: email || undefined,
        password: password || undefined,
      }),
    };

  const { fetch, loading, value, error: fetchError } = useFetchJson(bookingsEndpoint, opts);
  const logicError = value && value.error;
  const bookings = !logicError && value;
  const error = logicError || fetchError;

  return (
    <React.Fragment>
      <table>
        <tbody>
          <tr>
            <td>email</td>
            <td><input name="email" value={email} onChange={(e) => setEmail(e.target.value)}></input></td>
          </tr>
          <tr>
            <td>password</td>
            <td><input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input></td>
          </tr>
        </tbody>
      </table>
      <div><AsyncButton onClick={fetch} loading={loading}>Load</AsyncButton></div>
      <hr />
      {error && <ErrorWidget error={error} />}
      {bookings && <Bookings bookings={bookings} />}
    </React.Fragment>
  );
}

export default App;
