import { Router } from "itty-router";

const router = Router();

router.get("/", async (request, env) => {
  return new Response(home_html(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
});

router.get("/login", async (request, env) => {
  return Response.redirect(nid_login_url);
});

router.post("/nid_callback", async (request, env) => {
  const body = await request.text();
  console.log(body);
  const parms = body.split("&");
  if (parms[0].split("=")[1] !== "200") {
    return new Response("UnAuth", { status: 401 });
  }
  const userData = await fetch(get_user_data_url + parms[2].split("=")[1]);
  const userDataJson = await userData.json();
  const id = userDataJson.UserInfo[0].id;
  await env.USERS.put(id, JSON.stringify(userDataJson.UserInfo[0]));
  return new Response(id, { status: 200 });
});

export default {
  fetch: router.handle,
};

const nid_login_url =
  "https://opendata.fcu.edu.tw/fcuOauth/Auth.aspx?client_id=637910729086.5cd7ed3c953f4c1690abee7f3525644c.sign.iosclub.tw&client_url=https://sign.iosclub.tw/nid_callback";

const get_user_data_url =
  "https://opendata.fcu.edu.tw/fcuapi/api/GetUserInfo?client_id=637910729086.5cd7ed3c953f4c1690abee7f3525644c.sign.iosclub.tw&user_code=";

const home_html = (user) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>iOS Club 打卡系統</title>
    </head>
    <body>
      <div class="container mx-a">
        <h1>iOS Club 打卡系統!</h1>
        <a href="/login" class="bg-green">Login</a>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
    </body>
  </html>
`;
