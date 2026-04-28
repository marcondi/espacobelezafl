import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "espacodebelezafernandalima@gmail.com";
const FROM_ADDRESS = "Studio Fernanda Lima <onboarding@resend.dev>";

interface RequestBody {
  email?: string;
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const email = (body.email ?? "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "E-mail inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2b2b2b;">
        <h1 style="color: #b76e79; font-size: 24px; margin-bottom: 8px;">Bem-vinda ao Studio Fernanda Lima 💖</h1>
        <p style="font-size: 16px; line-height: 1.6;">Olá!</p>
        <p style="font-size: 16px; line-height: 1.6;">
          Obrigada por se inscrever na nossa newsletter. A partir de agora você vai receber em primeira mão nossas
          <strong>promoções exclusivas</strong>, novidades em tratamentos e dicas de beleza direto do nosso studio.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Quer agendar uma avaliação? Fale com a gente pelo WhatsApp:
          <a href="https://wa.me/5565999254653" style="color: #b76e79; font-weight: bold;">(65) 99925-4653</a>
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">
          Com carinho,<br/>
          <strong>Equipe Studio Fernanda Lima</strong>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 12px; color: #888;">
          Você está recebendo este e-mail porque se inscreveu no site do Studio Fernanda Lima.
        </p>
      </div>
    `;

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2b2b2b;">
        <h2 style="color: #b76e79;">Nova inscrição na newsletter ✨</h2>
        <p style="font-size: 16px;">Um novo e-mail acabou de se inscrever no site:</p>
        <p style="font-size: 18px; font-weight: bold; background: #faf3f4; padding: 12px 16px; border-radius: 8px;">
          ${email}
        </p>
        <p style="font-size: 14px; color: #666;">Data: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Cuiaba" })}</p>
      </div>
    `;

    const sendEmail = (to: string, subject: string, html: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
      });

    const [welcomeRes, adminRes] = await Promise.all([
      sendEmail(email, "Bem-vinda ao Studio Fernanda Lima 💖", welcomeHtml),
      sendEmail(
        ADMIN_EMAIL,
        `Nova inscrição na newsletter: ${email}`,
        adminHtml,
      ),
    ]);

    const welcomeOk = welcomeRes.ok;
    const adminOk = adminRes.ok;

    if (!welcomeOk) {
      const txt = await welcomeRes.text();
      console.error("Welcome email failed:", welcomeRes.status, txt);
    }
    if (!adminOk) {
      const txt = await adminRes.text();
      console.error("Admin notification failed:", adminRes.status, txt);
    }

    return new Response(
      JSON.stringify({
        success: welcomeOk && adminOk,
        welcomeSent: welcomeOk,
        adminNotified: adminOk,
      }),
      {
        status: welcomeOk || adminOk ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("newsletter-welcome error:", err);
    return new Response(
      JSON.stringify({ error: "Erro ao processar inscrição" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
