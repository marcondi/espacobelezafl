import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FERNANDA_EMAIL = "espacodebelezafernandalima@gmail.com";
const FROM_NAME = "Espaço de Beleza Fernanda Lima";

function welcomeHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5f7;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <tr><td style="background:linear-gradient(135deg,#c2185b,#e91e8c);padding:40px 32px;text-align:center">
          <p style="margin:0;font-size:13px;letter-spacing:3px;color:rgba(255,255,255,.75);text-transform:uppercase">Espaço de Beleza</p>
          <h1 style="margin:8px 0 0;font-size:32px;color:#fff;font-weight:700">Fernanda Lima</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;text-align:center">
          <p style="font-size:28px;margin:0 0 8px">💖</p>
          <h2 style="margin:0 0 16px;font-size:22px;color:#1a1a1a">Inscrição confirmada!</h2>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#555">
            Olá! A partir de agora você receberá em primeira mão nossas
            <strong>promoções exclusivas</strong>, novidades em serviços e dicas de beleza.
          </p>
          <a href="https://wa.me/5565999254653?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o."
             style="display:inline-block;background:linear-gradient(135deg,#c2185b,#e91e8c);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:700">
            Agendar pelo WhatsApp
          </a>
        </td></tr>
        <tr><td style="background:#f9f5f7;padding:24px 32px;text-align:center;border-top:1px solid #eee">
          <p style="margin:0 0 4px;font-size:13px;color:#888">Rua Arlindo Lopes da Silva, Nº 683, Centro — Tangará da Serra/MT</p>
          <p style="margin:0 0 4px;font-size:13px;color:#888">Seg–Sex: 09h às 19h &nbsp;|&nbsp; Sáb: 09h às 17h</p>
          <p style="margin:12px 0 0;font-size:11px;color:#bbb">Você recebeu este e-mail porque se inscreveu em nosso site.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function notificationHtml(email: string, subscribedAt: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9f5f7;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="500" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <tr><td style="background:linear-gradient(135deg,#c2185b,#e91e8c);padding:28px 32px;text-align:center">
          <h2 style="margin:0;color:#fff;font-size:20px">🎉 Nova inscrita na Newsletter!</h2>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#333">Uma nova pessoa se inscreveu para receber suas promoções:</p>
          <div style="background:#fdf0f5;border-left:4px solid #c2185b;border-radius:8px;padding:16px 20px;margin:0 0 24px">
            <p style="margin:0;font-size:18px;font-weight:700;color:#c2185b">${email}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#888">Inscrito em: ${subscribedAt}</p>
          </div>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6">
            Veja todos os inscritos no Supabase → tabela <strong>newsletter_subscribers</strong>.
          </p>
        </td></tr>
        <tr><td style="background:#f9f5f7;padding:20px 32px;text-align:center;border-top:1px solid #eee">
          <p style="margin:0;font-size:12px;color:#bbb">Espaço de Beleza Fernanda Lima — Sistema Automático</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY não configurada");
      return new Response(JSON.stringify({ error: "Serviço de e-mail não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email } = await req.json() as { email: string };
    if (!email) {
      return new Response(JSON.stringify({ error: "E-mail não informado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscribedAt = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Cuiaba",
      dateStyle: "short",
      timeStyle: "short",
    });

    async function sendEmail(to: string, subject: string, html: string) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <onboarding@resend.dev>`,
          to,
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`Resend error para ${to}:`, res.status, err);
        throw new Error(`Falha ao enviar para ${to}: ${res.status} ${err}`);
      }
      return res.json();
    }

    const results = await Promise.allSettled([
      sendEmail(email, "Bem-vinda à Newsletter 💖 — Espaço de Beleza Fernanda Lima", welcomeHtml(email)),
      sendEmail(FERNANDA_EMAIL, `🎉 Nova inscrita na newsletter: ${email}`, notificationHtml(email, subscribedAt)),
    ]);

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`E-mail ${i === 0 ? "inscrito" : "Fernanda"} falhou:`, r.reason);
      }
    });

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 2) {
      return new Response(JSON.stringify({ error: "Falha ao enviar e-mails" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("newsletter-welcome error:", e);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
