(function(global) {

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

  function ErrorWidget({ error }) {
    const cssOuter = {
      float: "left",
      padding: "1em",
      background: "gold",
      color: "red",
      fontWeight: "bold",
      border: "solid 2px red",
    };
    const cssMessage = {
    };
    const cssData = {
    };
    const cssTitle = {
      border: "none",
      borderBottom: "solid 2px black",
    };
    return (
      <div style={cssOuter}>
        <div style={cssTitle}>Error</div>
        <div style={cssMessage}>{
          error
            ? error.message || error.toString()
            : "There was an error"
        }</div>
        {
          (error && error.httpStatus) && (
            <div style={cssMessage}>{`http.status=${error.httpStatus}`}</div>
          )
        }
        {
          (error && error.data) && (
            <pre style={cssData}>{
              JSON.stringify(error.data, null, 1)
            }</pre>
          )
        }
      </div>
    )
  }

  function Bookings({ bookings }) {
    let lastDate = null;
    const activityNames = bookings.reduce((names, booking) => {
      if (names.indexOf(booking.name) < 0) {
        names.push(booking.name);
      }
      return names;
    }, []);
    return (
      <React.Fragment>
        <style>
          {`
          @media only screen and (max-width: 640px) {
            table.bookings {
              width: 100%;
            }
          }
          `}
        </style>
        <h1>{activityNames.join(", ")}</h1>
        <table className="bookings">
          <tbody>
            {
              bookings.map((booking, i) => {
                // booking.start and booking.end format: "2019-03-02T17:20:00"
                const [date, time] = booking.start.split("T");

                // Format, e.g. "2019-03-02" as "Sat Mar 02 2019"
                const dateStr = new Date(date).toString().split(" ").slice(0, 4).join(" ");

                const newDate = date !== lastDate;
                lastDate = date;

                return (
                  <tr key={i}>
                    <td>{newDate ? dateStr : ""}</td>
                    <td>{time}</td>
                    <td>{booking.available ? "✅" : "❌"}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </React.Fragment>
    );
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
        <div>email <input name="email" value={email} onChange={(e) => setEmail(e.target.value)}></input></div>
        <div>password <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input></div>
        <div><button onClick={fetch}>Load</button></div>
        {loading && <div>Loading</div>}
        {error && <ErrorWidget error={error} />}
        {bookings && <Bookings bookings={bookings} />}
      </React.Fragment>
    );
  }

  global.App = App;
}(window));
