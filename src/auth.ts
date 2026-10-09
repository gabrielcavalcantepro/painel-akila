/**
 * Autenticação simples de admin único (só a Ákila/você acessam o
 * painel). Sem usuário/senha por pessoa, só uma senha compartilhada
 * (env.DASHBOARD_PASSWORD) e um cookie de sessão assinado com HMAC
 * (env.SESSION_SECRET), sem precisar de nenhuma biblioteca externa de
 * JWT — é só Web Crypto, que já vem no runtime do Worker.
 */

export const COOKIE_NAME = "painel_sessao";
const SESSION_TTL_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

async function assinar(valor: string, segredo: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(valor));
  return btoa(String.fromCharCode(...new Uint8Array(assinatura)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function criarTokenSessao(segredo: string): Promise<string> {
  const expiraEm = Date.now() + SESSION_TTL_SEGUNDOS * 1000;
  const corpo = `ok.${expiraEm}`;
  const assinatura = await assinar(corpo, segredo);
  return `${corpo}.${assinatura}`;
}

export async function tokenValido(token: string | undefined, segredo: string): Promise<boolean> {
  if (!token) return false;
  const partes = token.split(".");
  if (partes.length !== 3) return false;
  const [marcador, expiraStr, assinaturaRecebida] = partes;
  if (marcador !== "ok") return false;
  const expiraEm = Number(expiraStr);
  if (!Number.isFinite(expiraEm) || Date.now() > expiraEm) return false;
  const assinaturaEsperada = await assinar(`${marcador}.${expiraStr}`, segredo);
  return assinaturaEsperada === assinaturaRecebida;
}

export function lerCookie(request: Request, nome: string): string | undefined {
  const cabecalho = request.headers.get("Cookie");
  if (!cabecalho) return undefined;
  for (const parte of cabecalho.split(";")) {
    const [chave, ...resto] = parte.trim().split("=");
    if (chave === nome) return resto.join("=");
  }
  return undefined;
}

export function cookieDeLogin(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SEGUNDOS}`;
}

export function cookieDeLogout(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}
