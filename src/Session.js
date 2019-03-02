const rpn = require("request-promise-native");

class Session {
  constructor() {
    // use separate cookie jar for each session
    this.jar = rpn.jar();
    this.req = rpn.defaults({ jar: this.jar });
    this.host = "https://www.sport-sheffield.com";
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

  async getBookings(activityCode = "WEBSQ", start = "2019-03-01", end = "2019-03-08") {
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

module.exports = Session;
