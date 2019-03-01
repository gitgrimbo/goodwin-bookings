const rpn = require("request-promise-native");

class Session {
  constructor() {
    // use separate cookie jar for each session
    this.jar = rpn.jar();
    this.req = rpn.defaults({ jar: this.jar });
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
    const loginHtml = await this.req("https://www.sport-sheffield.com/online/account/login");

    const requestVerificationToken = this.getRequestVerificationToken(loginHtml);
    if (!requestVerificationToken) {
      throw new Error(`requestVerificationToken not found`);
    }

    console.log("\n\nrequestVerificationToken\n\n", requestVerificationToken);

    const loginResult = await this.req({
      method: "POST",
      uri: "https://www.sport-sheffield.com/online/account/login",
      form: {
        "__RequestVerificationToken": requestVerificationToken,
        "ReturnUrl": "/online/bookings/",
        "Email": email,
        "Password": password,
      },
    });

    return loginResult;
  }

  async getBookings(start = "2019-03-01", end = "2019-03-08") {
    const qs = {
      "linkedPlus2Id": "",
      start,
      end,
      "_": Date.now(),
    };
    return await this.req({
      uri: "https://www.sport-sheffield.com/online/bookings/slots/WEBSQ",
      qs,
    });
  }
}

module.exports = Session;
