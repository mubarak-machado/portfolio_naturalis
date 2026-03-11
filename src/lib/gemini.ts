/**
 * Gemini AI Service — Geração de Textos de Marketing
 * ====================================================
 * Integra com o Google Gemini 2.0 Flash para gerar
 * textos persuasivos de marketing a partir de dados do produto.
 */

import { GoogleGenAI } from '@google/genai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string

let ai: GoogleGenAI | null = null

function getAI(): GoogleGenAI {
    if (!ai) {
        if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY não configurada. Adicione ao arquivo .env')
        ai = new GoogleGenAI({ apiKey: API_KEY })
    }
    return ai
}

export interface MarketingTextResult {
    headline: string
    body: string
    cta: string
}

export interface RefinedPromptResult {
    refinedPrompt: string
    strategy: string
}

/**
 * Gera 3 opções de texto de marketing persuasivo para um produto.
 */
export async function generateMarketingTexts(
    productName: string,
    productDescription: string | null,
    productPrice: number,
    purpose: string,
    refinedPrompt?: string
): Promise<MarketingTextResult[]> {
    const genAI = getAI()

    const prompt = `Você é um Estrategista de Marketing e Copywriter Sênior, focado no nicho de suplementos naturais, encapsulados e bem-estar no Brasil.

PRODUTO:
- Nome: ${productName}
- Descrição: ${productDescription || 'Sem descrição'}
- Preço: R$ ${productPrice.toFixed(2).replace('.', ',')}

OBJETIVO DA CAMPANHA: ${purpose}

${refinedPrompt ? `DIRETRIZES ESTRATÉGICAS ADICIONAIS:\n${refinedPrompt}` : ''}

Sua tarefa é criar 3 opções de copy altalmente persuasivas, focadas em conversão.
Cada opção DEVE ter uma abordagem estratégica única:
Opção 1: Foco na Dor/Problema (Mostre que entende o cliente e apresente a solução)
Opção 2: Foco no Benefício/Transformação (Aspiracional, foco na mudança de vida)
Opção 3: Foco em Oferta e Urgência (Mais agressiva, direcionada a fechar venda)

Gere APENAS e EXATAMENTE um JSON válido no formato abaixo. NÃO adicione texto markdown em volta.
[
  { 
    "headline": "frase de impacto curta (máximo 6 a 8 palavras)", 
    "body": "texto persuasivo e empático (2 a 3 frases curtas, máximo 35 palavras)", 
    "cta": "chamada para ação direta (máximo 5 palavras)"
  },
  { "headline": "...", "body": "...", "cta": "..." },
  { "headline": "...", "body": "...", "cta": "..." }
]

Regras adicionais:
- Use linguagem brasileira, envolvente e que conecte rapidamente.
- Cuidado com o tamanho do texto para não cortar na arte (body muito curto ou muito longo).
- Emojis são permitidos, mas sem exageros.`

    let text: string

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.9,
                maxOutputTokens: 4096,
            }
        })
        text = response.text?.trim() || ''
    } catch (apiErr: unknown) {
        const msg = apiErr instanceof Error ? apiErr.message : String(apiErr)
        throw new Error(`Erro na API Gemini: ${msg}`)
    }

    // Extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
        throw new Error('A IA não retornou um formato válido. Tente novamente.')
    }

    let parsed: MarketingTextResult[]
    try {
        parsed = JSON.parse(jsonMatch[0]) as MarketingTextResult[]
    } catch {
        throw new Error('Erro ao interpretar resposta da IA. Tente novamente.')
    }

    if (!Array.isArray(parsed) || parsed.length < 1) {
        throw new Error('Resposta inesperada da IA.')
    }

    return parsed.slice(0, 3)
}

/**
 * Refina o objetivo do usuário em um prompt especializado e uma estratégia de marketing.
 */
export async function refineMarketingPurpose(
    productName: string,
    productDescription: string | null,
    purpose: string
): Promise<RefinedPromptResult> {
    const genAI = getAI()

    const prompt = `Você é um Diretor de Criação e Estrategista de Marcas de Luxo. 
Sua tarefa é transformar um OBJETIVO DE MARKETING simples em um "PROMPT ESPECIALIZADO" e uma "ESTRÉGIA DE CAMPANHA" detalhada.

PRODUTO: ${productName}
DESCRIÇÃO: ${productDescription || 'Suplemento natural premium'}
OBJETIVO BRUTO: ${purpose}

Gere um JSON com:
1. "refinedPrompt": Um parágrafo longo e detalhado em REGRAS DE PERSONA para ser usado por outra IA para escrever copies. Deve incluir tom de voz, gatilhos mentais específicos para o objetivo, e diretrizes de estilo.
2. "strategy": Uma explicação curta (máximo 20 palavras) para o usuário sobre qual técnica de marketing será usada.

Exemplo de refinedPrompt: "Aja como um especialista em neurovendas. O tom deve ser sofisticado e acolhedor. Use o gatilho da autoridade e escassez. Foque na transformação física e mental que o produto proporciona. Evite clichês de vendas agressivas..."

Gere APENAS o JSON:
{
  "refinedPrompt": "...",
  "strategy": "..."
}`

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        })
        const text = response.text?.trim() || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Falha ao refinar o prompt.')
        return JSON.parse(jsonMatch[0]) as RefinedPromptResult
    } catch (err) {
        console.error('Erro ao refinar prompt:', err)
        return {
            refinedPrompt: `Gere cópias persuasivas para ${productName} focadas em ${purpose}.`,
            strategy: 'Abordagem direta de conversão.'
        }
    }
}

export function isGeminiConfigured(): boolean {
    return !!API_KEY
}
