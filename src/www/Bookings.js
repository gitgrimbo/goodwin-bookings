import React from "react";

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

export default Bookings;
