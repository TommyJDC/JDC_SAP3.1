import { useState, useCallback, useMemo } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const useGeminiSummary = (apiKey: string) => {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize the Generative AI client
    const genAI = useMemo(() => {
        console.log("useGeminiSummary: Initializing with API Key:", apiKey ? 'Provided' : 'Missing');
        if (!apiKey) {
            setError("Clé API Gemini manquante.");
            return null;
        }
        try {
            return new GoogleGenerativeAI(apiKey);
        } catch (err: any) { // Add type annotation for err
            console.error("Error initializing GoogleGenerativeAI:", err);
            setError("Erreur d'initialisation de l'API Gemini. Vérifiez la clé API.");
            return null;
        }
    }, [apiKey]);

    const generateSummary = useCallback(async (prompt: string) => {
        console.log("useGeminiSummary: generateSummary called.");
        if (!prompt) {
            console.log("useGeminiSummary: No prompt provided, skipping generation.");
            setSummary('');
            setError(null); // Clear error if prompt is empty
            setIsLoading(false);
            return;
        }
        if (!genAI) {
            console.error("useGeminiSummary: genAI client not initialized. Cannot generate.");
            setError("Client API Gemini non initialisé.");
            setIsLoading(false);
            return;
        }

        console.log("useGeminiSummary: Generating with prompt:", prompt);
        setIsLoading(true);
        setError(null);
        setSummary(''); // Clear previous summary

        try {
            // Use gemini-1.5-pro-latest model
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

            const generationConfig = {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            };

            const safetySettings = [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ];

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig,
                safetySettings,
            });

            const response = result.response;
            console.log("useGeminiSummary: Raw API Response:", response); // Log the raw response

            // Check if response or candidates exist before accessing text
            if (response && response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts.length > 0) {
                 const generatedText = response.candidates[0].content.parts[0].text || '';
                 console.log("useGeminiSummary: Generated text:", generatedText);
                 setSummary(generatedText);
            } else {
                 // Handle cases where the response might be empty or blocked
                 const blockReason = response?.promptFeedback?.blockReason;
                 const finishReason = response?.candidates?.[0]?.finishReason;
                 console.warn(`useGeminiSummary: Gemini response issue. Block Reason: ${blockReason}, Finish Reason: ${finishReason}`);
                 setError(blockReason ? `Génération bloquée: ${blockReason}` : (finishReason ? `Génération terminée avec raison: ${finishReason}` : "Aucune réponse textuelle reçue de l'IA."));
                 setSummary('');
            }


        } catch (err: any) {
            console.error("Error generating summary with Gemini:", err);
             if (err.message && err.message.includes('API key not valid')) {
                 setError("Clé API Gemini invalide ou expirée.");
             } else if (err.message && err.message.includes('SAFETY')) {
                 setError("La génération a été bloquée pour des raisons de sécurité.");
            } else {
                setError(err.message || "Une erreur inconnue est survenue lors de la génération.");
            }
            setSummary(''); // Ensure summary is cleared on error
        } finally {
            setIsLoading(false);
        }
    }, [genAI]); // Dependency array includes genAI instance

    return { summary, isLoading, error, generateSummary };
};

export default useGeminiSummary;
