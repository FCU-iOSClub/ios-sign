
export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      if (request.url.endsWith("/nid_callback")) {
        const body = await request.text();
        console.log(body);
        const parms = body.split("&");
        if (parms[0].split("=")[1] !== "200") {
          return new Response("UnAuth", { status: 401 });
        }
        const userData = await fetch(
          get_user_data_url + parms[2].split("=")[1]
        );
        const userDataJson = await userData.json();
        const id = userDataJson.UserInfo[0].id;
        await env.USERS.put(id, JSON.stringify(userDataJson.UserInfo[0]));
        return new Response(id, { status: 200 });
      }
      return new Response("Not allowed", { status: 405 });
    }
    if (request.url.endsWith("/login")) {
      return Response.redirect(nid_login_url);
    }
    return new Response(home_html);
  },
};

const nid_login_url =
  "https://opendata.fcu.edu.tw/fcuOauth/Auth.aspx?client_id=637910729086.5cd7ed3c953f4c1690abee7f3525644c.sign.iosclub.tw&client_url=https://sign.iosclub.tw/nid_callback";

const get_user_data_url =
  "https://opendata.fcu.edu.tw/fcuapi/api/GetUserInfo?client_id=637910729086.5cd7ed3c953f4c1690abee7f3525644c.sign.iosclub.tw&user_code=";

const home_html = html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Document</title>
    </head>
  </html>
`;
