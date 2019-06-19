const { expect } = require("chai");
const {
  Session,
  ACTIVITY_CODES,
} = require("../Session");

function dummyTransport() {
  let args;
  function dummyReq(...theArgs) {
    args = theArgs;
  };
  dummyReq.args = () => args;
  return dummyReq;
}

describe("Session", function() {
  let dt;

  beforeEach(() => {
    dt = dummyTransport();
  });

  it("getBookings with no options should throw Error", () => {
    const s = Session.withDummyTransport(dt);
    expect(() => s.getBookings()).to.throw;
  });

  it("getBookings using startMillis and endMillis", () => {
    const s = Session.withDummyTransport(dt);
    const start = "2019-01-01";
    const end = "2019-01-08";
    s.getBookings({
      activityCode: ACTIVITY_CODES.WEBSQ,
      startMillis: new Date(start).getTime(),
      endMillis: new Date(end).getTime(),
    });
    const [{ uri, qs }] = dt.args();
    expect(qs.start).to.equal(start);
    expect(qs.end).to.equal(end);
  });
});
