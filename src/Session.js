const rpn = require("request-promise-native");

const ACTIVITY_CODES = {
  WEBSQ: "WEBSQ",
};

class Session {
  constructor() {
  }

  static withRealTransport() {
    const s = new Session();
    // use separate cookie jar for each session
    s.jar = rpn.jar();
    s.req = rpn.defaults({ jar: s.jar });
    s.host = "https://www.sport-sheffield.com";
    return s;
  }

  static withDummyTransport(req) {
    const s = new Session();
    s.req = req;
    s.host = "https://www.sport-sheffield.com";
    return s;
  }

  uri(path) {
    return this.host + path;
  }

  getRequestVerificationToken(html) {
    const re = /<input name="__RequestVerificationToken" type="hidden" value="(.*?)"/;
    const exec = re.exec(html);
    if (!exec || exec.length < 2) {
      throw new Error(`Could not match "${re}" to "${html}"`);
    }
    const token = exec[1];
    return token;
  }

  async login(email, password) {
    const loginHtml = await this.req(this.uri("/online/account/login"));

    const requestVerificationToken = this.getRequestVerificationToken(loginHtml);
    if (!requestVerificationToken) {
      throw new Error(`requestVerificationToken not found`);
    }

    console.log("\n\nrequestVerificationToken\n\n", requestVerificationToken);

    const loginResult = await this.req({
      method: "POST",
      uri: this.uri("/online/account/login"),
      form: {
        __RequestVerificationToken: requestVerificationToken,
        ReturnUrl: "/online/bookings/",
        Email: email,
        Password: password,
      },
    });

    return loginResult;
  }

  async _getBookings({
    activityCode = "WEBSQ",
    start = undefined,
    end = undefined,
  }) {
    if (!start) throw new Error(`start is mandatory`);
    if (!end) throw new Error(`end is mandatory`);
    const qs = {
      linkedPlus2Id: "",
      start,
      end,
      _: Date.now(),
    };
    return await this.req({
      uri: this.uri(`/online/bookings/slots/${activityCode}`),
      qs,
    });
  }

  dateParam(dateStr, dateStrParamName, millis, millisParamName) {
    if (dateStr) {
      return dateStr;
    }
    if (millis) {
      return new Date(millis).toISOString().substring(0, 10);
    }
    throw new Error(`either ${dateStrParamName} or ${millisParamName} is required`);
  }

  requiredParam(value, name) {
    if (typeof value === "undefined") {
      throw new Error(`${name} is required`);
    }
    return value;
  }

  async getBookings({
    activityCode = undefined,
    start = undefined,
    end = undefined,
    startMillis = undefined,
    endMillis = undefined,
  }) {
    activityCode = this.requiredParam(activityCode, "activityCode");
    start = this.dateParam(start, "start", startMillis, "startMillis");
    end = this.dateParam(end, "end", endMillis, "endMillis");
    return this._getBookings({
      activityCode,
      start,
      end,
    });
  }

  /**
  Sample response.
  [
    {"documentId":null,"booked":false,"id":"SQ01","productId":"SQ01","productIds":null,"activityId":"WEBSQ",
      "start":"2019-03-04T18:00:00","end":"2019-03-04T18:40:00","type":"SQ01","color":"#FFD24F","name":"Squash Court 1",
      "count":0,"iconName":"squash1","places":"0","price":7,"available":false,"shortName":null,"colorMode":"dark",
      "paid":false,"resourceGroupId":0,"location":null,"description":null,"canCancelUntil":null,"cantBeCancelled":false},
    {"documentId":null,"booked":false,"id":"SQ02","productId":"SQ02","productIds":null,"activityId":"WEBSQ",
      "start":"2019-03-04T18:00:00","end":"2019-03-04T18:40:00","type":"SQ02","color":"#FFD24F","name":"Squash Court 2",
      "count":0,"iconName":"squash1","places":"1","price":7,"available":true,"shortName":null,"colorMode":"dark",
      "paid":false,"resourceGroupId":0,"location":null,"description":null,"canCancelUntil":null,"cantBeCancelled":false},
    {"documentId":null,"booked":false,"id":"SQ03","productId":"SQ03","productIds":null,"activityId":"WEBSQ",
      "start":"2019-03-04T18:00:00","end":"2019-03-04T18:40:00","type":"SQ03","color":"#FFD24F","name":"Squash Court 3",
      "count":0,"iconName":"squash1","places":"0","price":7,"available":false,"shortName":null,"colorMode":"dark",
      "paid":false,"resourceGroupId":0,"location":null,"description":null,"canCancelUntil":null,"cantBeCancelled":false},
    {"documentId":null,"booked":false,"id":"SQ04","productId":"SQ04","productIds":null,"activityId":"WEBSQ",
      "start":"2019-03-04T18:00:00","end":"2019-03-04T18:40:00","type":"SQ04","color":"#FFD24F","name":"Squash Court 4",
      "count":0,"iconName":"squash1","places":"0","price":7,"available":false,"shortName":null,"colorMode":"dark",
      "paid":false,"resourceGroupId":0,"location":null,"description":null,"canCancelUntil":null,"cantBeCancelled":false}
  ]
  */
  async getCourtAvailablility(activityCode = "WEBSQ", start = "2019-03-02T08:00:00", end = "2019-03-02T08:40:00") {
    // TODO - this gets availability of courts at a particular time
    const qs = {
      linkedPlus2Id: "",
      start,
      end,
      group: false,
    };
    return await this.req({
      uri: this.uri(`/online/bookings/slots/${activityCode}`),
      qs,
    });
  }

  async getActivityGroups() {
    const NORTON_PLAYING_FIELDS = "NPF";
    const GOODWIN = "HO";
    const location = GOODWIN;
    const qs = {
      linkedPlus2Id: "",
    };
    return this.req({
      uri: this.uri(`/online/bookings/activitygroups/${location}`),
      qs,
    });
  }
}

module.exports = {
  Session,
  ACTIVITY_CODES,
};
