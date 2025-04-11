import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log("🚀 Webhook geldi");

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ Webhook secret eksik");
      return new Response("Missing secret", { status: 400 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      console.error("❌ Svix header'ları eksik");
      return new Response("Invalid headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);
    console.log("📦 Payload geldi:", payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(body, {
        "svix-id":svix_id,
        "svix-timestamp":svix_timestamp,
        "svix-signature":svix_signature
      } as any);
    } catch (e) {
      console.error("❌ Webhook doğrulaması başarısız:", e);
      return new Response("Invalid signature", { status: 400 });
    }

    const eventType = evt.type;
    console.log("📨 Event tipi:", eventType);

    if (eventType === "user.created") {
      console.log("🟢 user.created olayı işlendi");
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0]?.email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();
      const username = email?.split("@")[0] || "no_username";

      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          fullname: name,
          image: image_url,
          clerkId: id,
          username,
        });

        console.log("✅ Kullanıcı veritabanına eklendi");
      } catch (error) {
        console.error("❌ Mutation hatası:", error);
        return new Response("Mutation error", { status: 500 });
      }
    }

    return new Response("Webhook received", { status: 200 });
  }),
});

export default http;
