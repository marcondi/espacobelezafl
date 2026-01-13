import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CategoryExpenseInput {
  category: string;
  amount: number;
}

interface RequestBody {
  monthLabel: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  categoryExpenses: CategoryExpenseInput[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as RequestBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const monthLabel = body.monthLabel;
    const { totalIncome, totalExpense, balance } = body.summary;
    const expensesSummary =
      body.categoryExpenses
        .map((c) => `${c.category}: R$ ${c.amount.toFixed(2)}`)
        .join("; ") || "sem despesas registradas";

    const prompt = `Você é um educador financeiro que fala português do Brasil.

Analise o seguinte resumo financeiro do mês ${monthLabel} e gere exatamente 3 dicas curtas, práticas e específicas de economia:

- Entradas no mês: R$ ${totalIncome.toFixed(2)}
- Saídas no mês: R$ ${totalExpense.toFixed(2)}
- Saldo do mês: R$ ${balance.toFixed(2)}
- Despesas por categoria: ${expensesSummary}

Responda em JSON com o seguinte formato EXATO:
{
  "tips": [
    "dica 1 em uma frase objetiva",
    "dica 2 em uma frase objetiva",
    "dica 3 em uma frase objetiva"
  ]
}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "Você é um educador financeiro brasileiro. Seja sempre direto, prático e positivo.",
            },
            { role: "user", content: prompt },
          ],
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Limite de uso da IA excedido. Tente novamente em alguns instantes.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "Créditos de IA esgotados neste workspace. Adicione créditos para continuar usando as dicas financeiras.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Erro na geração das dicas" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await response.json();
    const contentRaw: string | undefined =
      json.choices?.[0]?.message?.content ??
      '{"tips":["Revise seus gastos fixos e cancele o que não usa.","Defina um valor máximo para gastos supérfluos no mês.","Reserve ao menos 10% da renda para objetivos futuros."]}';

    const content = contentRaw ?? '';

    let tips: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.tips)) {
        tips = parsed.tips.slice(0, 3).map((t: unknown) => String(t));
      }
    } catch {
      tips = [
        "Revise seus gastos fixos e cancele serviços que não usa mais.",
        "Estabeleça um limite semanal para gastos variáveis (lazer, delivery, etc.).",
        "Separe um valor fixo todo mês para montar uma reserva de emergência.",
      ];
    }

    if (tips.length === 0) {
      tips = [
        "Acompanhe seus gastos por categoria para identificar onde é possível economizar.",
        "Priorize quitar dívidas mais caras antes de assumir novos compromissos.",
        "Defina uma meta de economia mensal, mesmo que pequena, e acompanhe o progresso.",
      ];
    }

    return new Response(JSON.stringify({ tips }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("financial-tips error:", e);
    return new Response(
      JSON.stringify({ error: "Erro ao processar as dicas financeiras." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
