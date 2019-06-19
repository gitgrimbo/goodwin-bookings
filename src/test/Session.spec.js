const { expect, use } = require("chai");
use(require("chai-as-promised"));
const {
  Session,
  ACTIVITY_CODES,
} = require("../Session");

function dummyTransport() {
  let reqs = [];
  function dummyReq(...theArgs) {
    reqs.push(theArgs);
    // transport is expected to return a JSON string.
    return "null";
  };
  dummyReq.reqs = () => reqs;
  return dummyReq;
}

describe("Session", function() {
  let dt;

  beforeEach(() => {
    dt = dummyTransport();
  });

  describe("getBookings", function() {
    it("no options should throw Error", () => {
      const s = Session.withDummyTransport(dt);

      return expect(
        s.getBookings()
      ).to.be.rejected;
    });

    it("startMillis and endMillis options are set as query params", async () => {
      const s = Session.withDummyTransport(dt);
      const start = "2019-01-01";
      const end = "2019-01-08";
      await s.getBookings({
        activityCode: ACTIVITY_CODES.WEBSQ,
        startMillis: new Date(start).getTime(),
        endMillis: new Date(end).getTime(),
      });
      const [req] = dt.reqs();
      const [{ uri, qs }] = req;
      expect(qs.start).to.equal(start);
      expect(qs.end).to.equal(end);
    });

    it("unpaid invoices", () => {
      const unpaidInvoicesResponse = [
        {
          "documentId": null,
          "booked": false,
          "id": "",
          "productId": null,
          "productIds": null,
          "activityId": "WEBSQ",
          "start": "2019-06-19T13:15:05",
          "end": "2019-06-26T00:00:00",
          "type": "",
          "color": "#FFD24F",
          "name": "Squash Court - Web",
          "count": 1,
          "iconName": "squash1",
          "places": "1",
          "price": null,
          "available": false,
          "shortName": null,
          "colorMode": "dark",
          "paid": false,
          "resourceGroupId": 0,
          "location": null,
          "description": null,
          "canCancelUntil": null,
          "cantBeCancelled": false
        }
      ];
      const s = Session.withDummyTransport(({ uri, qs }) => {
        // ignore uri and qs as we only expect one call to the transport.
        return JSON.stringify(unpaidInvoicesResponse);
      });
      const start = "2019-01-01";
      const end = "2019-01-08";
      return expect(
        s.getBookings({
          // these values aren't important for the test
          activityCode: ACTIVITY_CODES.WEBSQ,
          startMillis: new Date(start).getTime(),
          endMillis: new Date(end).getTime(),
        })
      ).to.be.rejectedWith("Possible unpaid invoices");
    });
  });
});
