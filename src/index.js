import { Router } from "itty-router";
import { parse } from "cookie";

const router = Router();
const COOKIE_NID = "nid";
const COOKIE_SESSION = "session";

// home
router.get("/", async (request, env) => {
  // parse cookie
  const cookie = parse(request.headers.get("Cookie") || "");
  console.log(JSON.stringify(cookie));
  console.log(JSON.stringify(cookie[COOKIE_NID]));
  if (cookie[COOKIE_NID] && cookie[COOKIE_SESSION]) {
    // get user info from kv
    const userInfo = await env.USERS.get(cookie[COOKIE_NID], { type: "json" });
    console.log(JSON.stringify(userInfo));
    // valide session
    if (userInfo && userInfo.session === cookie[COOKIE_SESSION]) {
      userInfo.session = undefined;
      // return logined html
      return new Response(html_login(userInfo), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }
  }
  console.log("Not Login");
  return new Response(html_home(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
});

// favicon
router.get("/favicon.ico", async (request, env) => {
  return await fetch("https://iosclub.tw/icon.ico");
});

// login
router.get("/login", async (request, env) => {
  return Response.redirect(nid_login_url, 303);
});

// logout
router.get("/logout", async (request, env) => {
  const response = new Response("", { status: 303 });
  response.headers.append("Location", "/");
  response.headers.append("Set-Cookie", `${COOKIE_NID}=; Max-Age=0`);
  response.headers.append("Set-Cookie", `${COOKIE_SESSION}=; Max-Age=0`);
  return response;
});

router.post("/nid_callback", async (request, env) => {
  const body = await request.text();
  console.log(body);
  const parms = body.split("&");
  if (parms[0].split("=")[1] !== "200") {
    return new Response("UnAuth", { status: 401 });
  }
  // fetch user data from nid opendata
  const userData = await fetch(get_user_data_url + parms[2].split("=")[1]);
  const userInfo = (await userData.json()).UserInfo[0];
  const id = userInfo.id; // like "D0000123"
  // get uuid
  const uuid = (
    await (await fetch("https://www.uuidtools.com/api/generate/v1")).json()
  )[0];
  userInfo.session = uuid;
  await env.USERS.put(id, JSON.stringify(userInfo));
  // create response
  const response = new Response("", { status: 303 });
  response.headers.append("Location", "/");
  response.headers.append("Set-Cookie", `${COOKIE_NID}=${id}`);
  response.headers.append("Set-Cookie", `${COOKIE_SESSION}=${uuid}`);
  return response;
});

router.all("*", () => new Response("404, not found!", { status: 404 }));

export default {
  fetch: router.handle,
};

const nid_login_url =
  "https://opendata.fcu.edu.tw/fcuOauth/Auth.aspx?client_id=637910729086.5cd7ed3c953f4c1690abee7f3525644c.sign.iosclub.tw&client_url=https://sign.iosclub.tw/nid_callback";

const get_user_data_url =
  "https://opendata.fcu.edu.tw/fcuapi/api/GetUserInfo?client_id=637910729086.5cd7ed3c953f4c1690abee7f3525644c.sign.iosclub.tw&user_code=";

// --------------------------------- html ---------------------------------

// no login html
const html_home = () => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>iOS Club 打卡系統</title>
    </head>
    <body>
      <div class="container mx-a">
        <h1>iOS Club 打卡系統</h1>
        <a href="/login" class="bg-green">Login</a>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
    </body>
  </html>
`;

// logined htlm

const html_login = (userInfo) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>iOS Club 打卡系統</title>
    </head>
    <body>
      <div class="container mx-a">
        <h1>iOS Club 打卡系統</h1>
        <h2>Hi ${userInfo.name} -- ${userInfo.unit_name}</h2>
        <a href="/logout" class="bg-red">Logout</a>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
    </body>
  </html>
`;
