import { GoogleGenAI } from "@google/genai";
import { ProductInputData, ProductInputType, PriceData, Coupon, DealStatus } from '../types';

if (!process.env.API_KEY) {
    throw new Error("A variável de ambiente API_KEY não está definida.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (base64: string, mimeType: string) => {
    return {
      inlineData: {
        data: base64,
        mimeType,
      },
    };
};

/**
 * Extracts a JSON object from a string, even if it's embedded in other text.
 * @param text The text containing the JSON object.
 * @returns The parsed JSON object or null if not found or invalid.
 */
const extractJsonFromText = (text: string): any | null => {
    const match = text.match(/{[\s\S]*}/);
    if (match && match[0]) {
        try {
            return JSON.parse(match[0]);
        } catch (e) {
            console.error("Falha ao analisar JSON extraído:", text, e);
            return null;
        }
    }
    return null;
};


export const analyzeProductInput = async (input: ProductInputData): Promise<{ name: string; brand: string; imageUrl: string } | null> => {
    let model;
    let contents;

    const jsonFormatInstruction = `Responda APENAS com um único objeto JSON contendo: "name" (string), "brand" (string), e "imageUrl" (string, URL direta e válida da imagem do produto. Se nenhuma imagem for encontrada, use uma string vazia "").`;

    switch (input.type) {
        case ProductInputType.URL:
            model = 'gemini-2.5-flash';
            contents = `Usando a busca, analise o conteúdo da URL do produto e extraia os detalhes. ${jsonFormatInstruction}. URL: ${input.value}`;
            break;
        case ProductInputType.TEXT:
            model = 'gemini-2.5-flash';
            contents = `Usando a busca, identifique o produto a partir desta descrição e encontre seus detalhes. ${jsonFormatInstruction}. Descrição: "${input.value}"`;
            break;
        case ProductInputType.IMAGE:
            model = 'gemini-2.5-flash-image';
            const [mimeType, base64Data] = input.value.split(';base64,');
            const imagePart = await fileToGenerativePart(base64Data, mimeType.replace('data:', ''));
            contents = { parts: [imagePart, { text: `Usando a busca, identifique o produto nesta imagem e encontre seus detalhes. ${jsonFormatInstruction}` }] };
            break;
        default:
            throw new Error("Tipo de entrada inválido");
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
            tools: [{googleSearch: {}}],
        },
    });
    
    const text = response.text.trim();
    if (text) {
        const parsedJson = extractJsonFromText(text);
        if (parsedJson) {
            return parsedJson;
        }
        console.error("Falha ao analisar JSON da resposta do Gemini:", text);
    }
    return null;
};

export const getProductPriceAnalysis = async (productName: string): Promise<{ price: number; storeName: string; storeUrl: string; priceHistory: PriceData[]; coupons: Coupon[]; dealStatus: DealStatus; dealReasoning: string; }> => {
    const model = 'gemini-2.5-pro';
    const prompt = `
        Para o produto "${productName}":

        1.  Use a busca do Google para encontrar o **melhor preço atual** em lojas online brasileiras (em BRL). Baseie sua resposta estritamente nos resultados da busca.
        2.  Gere um histórico de preços realista para os últimos 6 meses, onde o preço atual se encaixe de forma coerente.
        3.  Crie um ou dois cupons de desconto plausíveis.
        4.  Com base no histórico gerado e no preço atual, avalie a oferta como 'GOOD', 'AVERAGE' ou 'POOR'.
        5.  Forneça uma breve justificativa para a avaliação.

        Responda APENAS com um único objeto JSON com as seguintes chaves:
        - "price": number (o melhor preço atual encontrado em BRL)
        - "storeName": string (o nome da loja com o melhor preço)
        - "priceHistory": array de 6 objetos com "month" (string) e "price" (number)
        - "coupons": array de objetos com "code" (string) e "description" (string)
        - "dealStatus": string ('GOOD', 'AVERAGE', ou 'POOR')
        - "dealReasoning": string (justificativa da oferta)
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
           tools: [{googleSearch: {}}],
        },
    });

    const text = response.text.trim();
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    let storeUrl = '';
    if (groundingChunks) {
        for (const chunk of groundingChunks) {
            if (chunk.web && chunk.web.uri) {
                storeUrl = chunk.web.uri;
                break; // Usa a primeira URL válida da fonte de busca
            }
        }
    }

    if (!storeUrl) {
      console.warn("Não foi possível encontrar uma URL de fonte nos metadados. A URL do produto pode estar ausente.");
    }
    
    if (text) {
        const parsed = extractJsonFromText(text);
        if (parsed) {
            parsed.dealStatus = parsed.dealStatus as DealStatus;
            return { ...parsed, storeUrl: storeUrl || '' };
        }
        console.error("Falha ao analisar JSON da análise de preço do Gemini:", text);
        throw new Error("Não foi possível analisar os dados de preço do produto.");
    }
    throw new Error("Recebida uma resposta vazia da API de análise de preços.");
};
