import { COOKIE_NAME, cookieDeLogin, cookieDeLogout, criarTokenSessao, lerCookie, tokenValido } from "./auth";
import { DASHBOARD_HTML } from "./dashboard";
import { montarResumo } from "./resumo";

export interface Env {
  DB: D1Database;
  DASHBOARD_PASSWORD: string;
  SESSION_SECRET: string;
  ALLOWED_ORIGINS?: string;
}

const TIPOS_EVENTO_VALIDOS = new Set(["etapa_vista", "opcao_selecionada"]);

function respostaJson(corpo: unknown, status = 200, headersExtra?: HeadersInit): Response {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
  if (headersExtra) new Headers(headersExtra).forEach((v, k) => headers.set(k, v));
  return new Response(JSON.stringify(corpo), { status, headers });
}

/**
 * Ingestão de eventos do quiz (etapa vista / opção selecionada).
 * Endpoint público (o quiz não tem login), sem exigir CORS porque o
 * lado do quiz manda via navigator.sendBeacon com um Blob de tipo
 * text/plain (content-type "simples"), o que evita o preflight e faz
 * a requisição sempre chegar, mesmo cross-origin. Nunca retorna erro
 * visível: se o payload vier malformado, só ignora e responde 204.
 */
async function handleEventos(request: Request, env: Env): Promise<Response> {
  let corpo: Record<string, unknown>;
  try {
    corpo = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 204 });
  }

  const tipo = typeof corpo.tipo === "string" ? corpo.tipo : "";
  const etapa = typeof corpo.etapa === "string" ? corpo.etapa : "";
  if (!TIPOS_EVENTO_VALIDOS.has(tipo) || !etapa) {
    return new Response(null, { status: 204 });
  }

  const sessaoId = typeof corpo.sessaoId === "string" ? corpo.sessaoId.slice(0, 64) : "";
  if (!sessaoId) return new Response(null, { status: 204 });

  const campo = typeof corpo.campo === "string" ? corpo.campo.slice(0, 64) : null;
  const valor = typeof corpo.valor === "string" ? corpo.valor.slice(0, 200) : null;
  const rotulo = typeof corpo.label === "string" ? corpo.label.slice(0, 300) : null;
  const nome = typeof corpo.nome === "string" ? corpo.nome.slice(0, 100) : null;

  await env.DB.prepare(
    `INSERT INTO eventos (sessao_id, tipo, etapa, campo, valor, rotulo, nome)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
  )
    .bind(sessaoId, tipo, etapa, campo, valor, rotulo, nome)
    .run();

  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  let corpo: Record<string, unknown>;
  try {
    corpo = JSON.parse(await request.text());
  } catch {
    return respostaJson({ ok: false, erro: "Corpo inválido" }, 400);
  }
  const senha = typeof corpo.senha === "string" ? corpo.senha : "";

  if (!env.DASHBOARD_PASSWORD || senha !== env.DASHBOARD_PASSWORD) {
    return respostaJson({ ok: false, erro: "Senha incorreta" }, 401);
  }

  const token = await criarTokenSessao(env.SESSION_SECRET);
  return respostaJson({ ok: true }, 200, { "Set-Cookie": cookieDeLogin(token) });
}

function handleLogout(): Response {
  return respostaJson({ ok: true }, 200, { "Set-Cookie": cookieDeLogout() });
}

async function handleResumo(request: Request, env: Env): Promise<Response> {
  const token = lerCookie(request, COOKIE_NAME);
  if (!(await tokenValido(token, env.SESSION_SECRET))) {
    return respostaJson({ ok: false, erro: "Não autenticado" }, 401);
  }
  const resumo = await montarResumo(env.DB);
  return respostaJson({ ok: true, ...resumo });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/eventos") {
      return handleEventos(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/login") {
      return handleLogin(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/logout") {
      return handleLogout();
    }
    if (request.method === "GET" && url.pathname === "/api/resumo") {
      return handleResumo(request, env);
    }
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return new Response(DASHBOARD_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    }

    return new Response("Não encontrado", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
