const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 10000;

app.post("/api/answer", async (req, res) => {
    try {
        const query = req.body?.query?.trim();

        if (!query) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GEMINI_API_KEY is missing."
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Answer this question clearly and accurately.

Use Google Search when useful.

Question:
${query}`
                                }
                            ]
                        }
                    ],

                    tools: [
                        {
                            google_search: {}
                        }
                    ]
                })
            }
        );

        const raw = await response.text();

        let data;

        try {
            data = JSON.parse(raw);
        } catch {
            console.log("Gemini response:", raw);

            return res.status(500).json({
                error: "Gemini returned invalid JSON."
            });
        }

        if (!response.ok) {
            console.log("Gemini error:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Gemini API error."
            });
        }

        const answer =
            data?.candidates?.[0]
                ?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();

        if (!answer) {
            return res.status(500).json({
                error: "No answer was returned."
            });
        }

        const chunks =
            data?.candidates?.[0]
                ?.groundingMetadata
                ?.groundingChunks || [];

        const sources = [];

        for (const chunk of chunks) {
            if (chunk?.web?.uri) {
                sources.push({
                    title:
                        chunk.web.title ||
                        "Google source",

                    url:
                        chunk.web.uri
                });
            }
        }

        res.json({
            answer,
            sources
        });

    } catch (error) {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({
            error:
                error.message ||
                "Server error."
        });
    }
});


app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


app.listen(PORT, () => {

    console.log(
        `LUMOS running on port ${PORT}`
    );

});
