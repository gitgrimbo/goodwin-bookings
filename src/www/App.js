import React from "react";
import Bookings from "./Bookings";
import ErrorWidget from "./ErrorWidget";
import AsyncButton from "./AsyncButton";
import { ACTIVITY_CODES } from "../Session";

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

const useFetchJson = (endpoint) => {
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const [fetchError, setFetchError] = React.useState(null);

  // pass empty array to useEffect - i.e. run once.
  const fetch = async (opts) => {
    opts = opts || {};
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
    resetState() {
      setLoading(false);
      setValue(null);
      setFetchError(null);
    },
  };
}

function App({
  dev = false,
}) {
  const prodEndpoint = "https://1e53hmg02i.execute-api.eu-west-2.amazonaws.com/prod/getBookings";

  // use same order as activities.
  const sampleEndpoints = [
    //"./sample-responses/unpaid-invoices.json",
    //"./sample-responses/squash.json",
    "./sample-responses/squash.10102020.json",
    "./sample-responses/swimming.10102020.json",
  ];

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [activityState, setActivityState] = React.useState({});
  const setCheckboxState = (e) => {
    const { target } = e;
    setActivityState((state) => ({
      ...state,
      [target.name]: target.checked,
    }));
  };
  console.log("activityState", activityState);

  // name must match state name.
  const activities = [
    {
      name: "squash",
      activityCode: ACTIVITY_CODES.WEBSQ,
      groupslots: false,
    },
    {
      name: "swimming",
      activityCode: ACTIVITY_CODES.SWPOOL,
      groupslots: true,
    },
  ].map((activity, activityIdx) => {
    // { fetch, loading, value, error: fetchError }
    let bookingsEndpoint = prodEndpoint;
    if (dev) {
      bookingsEndpoint = sampleEndpoints[activityIdx];
    }
    console.log(activityIdx, bookingsEndpoint);
    activity.fetcher = useFetchJson(bookingsEndpoint);
    return activity;
  });

  const logicError = activities.find(({ fetcher }) => fetcher.value && fetcher.value.error);
  const bookings = !logicError && activities;
  const loading = activities.reduce((loading, fetcher) => loading || fetcher.loading, false);
  console.log("bookings", bookings);

  const fetch = async () => {
    const promises = activities
      .map((activity) => {
        if (!activityState[activity.name]) {
          // Activity not checked in UI, clear the old state
          activity.fetcher.resetState();
          return null;
        }

        console.log("fetch", activity);
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
              activityCode: activity.activityCode,
              groupslots: activity.groupslots,
            }),
          };
        console.log("fetching", opts);
        return activity.fetcher.fetch(opts);
      })
      .filter(Boolean);
    return Promise.all(promises);
  };

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
          <tr>
            <td><label htmlFor="activity_squash">squash</label></td>
            <td><input id="activity_squash" name="squash" type="checkbox" value={activityState.squash} onChange={(e) => setCheckboxState(e)}></input></td>
          </tr>
          <tr>
            <td><label htmlFor="activity_swimming">swimming</label></td>
            <td><input id="activity_swimming" name="swimming" type="checkbox" value={activityState.swimming} onChange={(e) => setCheckboxState(e)}></input></td>
          </tr>
        </tbody>
      </table>
      <div><AsyncButton onClick={fetch} loading={loading}>Load</AsyncButton></div>
      <hr />
      {
        activities && activities.map((activity) => {
          const error = (activity.value && activity.value.error) || (activity.fetcher && activity.fetcher.error);
          console.log("error", error, activity);
          return error ? <ErrorWidget error={error} /> : null;
        })
      }
      {
        activities && activities.map((activity) => {
          const booking = activity.fetcher && activity.fetcher.value;
          console.log("booking", booking, activity);
          return booking ? <Bookings heading={activity.name} bookings={booking} /> : null;
        }).filter(Boolean)
      }
    </React.Fragment>
  );
}

export default App;
