import OpenAI from 'openai';

// Point to Local LM Studio
const openai = new OpenAI({
    baseURL: 'http://127.0.0.1:1234/v1',
    apiKey: 'lm-studio', // Not used but required by SDK
    dangerouslyAllowBrowser: true // Required for client-side usage
});

export const ai = {
    async parseReceipt(base64Image) {
        try {
            const response = await openai.chat.completions.create({
                model: "qwen-2.5-vl", // Or whatever model is loaded in LM Studio
                messages: [
                    {
                        role: "system",
                        content: "You are a receipt parser. Extract the merchant name, total amount, and list of items from the receipt image. Return ONLY raw JSON. No markdown formatting."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Parse this receipt." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            });

            const content = response.choices[0].message.content;
            // Attempt to clean markdown if present
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('AI Parse Receipt Error:', error);
            throw error;
        }
    },

    async parseTextIntent(text) {
        try {
            const response = await openai.chat.completions.create({
                model: "qwen-2.5-vl",
                messages: [
                    {
                        role: "system",
                        content: "You are a financial assistant. Extract the amount, category, and merchant from the text. Return ONLY raw JSON: { amount: number, category: string, merchant: string }."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            });

            const content = response.choices[0].message.content;
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('AI Parse Intent Error:', error);
            throw error;
        }
    }
};
