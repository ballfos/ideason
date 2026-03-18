package handler

import (
	"context"
	"encoding/json"
	"fmt"

	"cloud.google.com/go/firestore"
	"google.golang.org/genai"
)

type AIClient struct {
	client *genai.Client
}

func NewAIClient(ctx context.Context, projectID, location string) (*AIClient, error) {
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		Project:  projectID,
		Location: location,
		Backend:  genai.BackendVertexAI,
	})
	if err != nil {
		return nil, err
	}
	return &AIClient{client: client}, nil
}

func (a *AIClient) Close() error {
	// genai.Client has no close method documented in the doc, let's keep it as is if needed or empty.
	return nil
}

func (a *AIClient) GenerateResponse(ctx context.Context, name, role, topic string, whiteboard map[string]interface{}, recentContext string) (map[string]interface{}, error) {
	modelName := "gemini-2.5-flash"

	whiteboardJSON, _ := json.MarshalIndent(whiteboard, "", "  ")
	whiteboardText := string(whiteboardJSON)

	systemInstruction := fmt.Sprintf(`あなたは%sです。%s
必ず「共有ホワイトボード」の文脈を踏まえて発言してください。

【出力形式（JSONのみ）】
{
  "message": "150文字程度の簡潔な新しいアイデアを含む発言内容",
  "summary": "これまでの議論の全体的な要約（150文字程度）",
  "ideas": [
    {"name": "アイデア名", "details": "具体的な内容"}
  ]
}

【厳守事項：アイデアの抽出・更新】
・既存のアイデアがブラッシュアップされた場合は、新しいアイデアとして追加せず、既存の項目の「details」を上書きしてください。
・全く新しいアイデアが出た場合のみ、リストに新規追加してください。
・似たようなアイデアの重複は絶対に避けてください。`, name, role)

	prompt := fmt.Sprintf("【お題】%s\n\n【現在の共有ホワイトボード（Talk内）】\n%s\n\n【直近の会話】\n%s\n\n上記の文脈を踏まえて、あなたの役割として発言し、ボードを最新の状態（message, summary, ideas）に更新したJSONを出力してください。", topic, whiteboardText, recentContext)

	config := &genai.GenerateContentConfig{
		Temperature:       genai.Ptr(float32(0.7)),
		ResponseMIMEType:  "application/json",
		SystemInstruction: &genai.Content{Parts: []*genai.Part{{Text: systemInstruction}}},
	}

	resp, err := a.client.Models.GenerateContent(ctx, modelName, []*genai.Content{{Parts: []*genai.Part{{Text: prompt}}, Role: "user"}}, config)
	if err != nil {
		return nil, err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no response from AI")
	}

	text := resp.Text()
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(text), &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal AI response: %v, text: %s", err, text)
	}

	return result, nil
}

func (a *AIClient) UpdateTalkWhiteboard(ctx context.Context, docRef *firestore.DocumentRef, summary string, ideas []interface{}) {
	_, _ = docRef.Update(ctx, []firestore.Update{
		{Path: "summary", Value: summary},
		{Path: "ideas", Value: ideas},
	})
}

func (a *AIClient) EmbedText(ctx context.Context, text string) ([]float32, error) {
	if text == "" {
		return nil, fmt.Errorf("text is empty")
	}
	res, err := a.client.Models.EmbedContent(ctx, "text-multilingual-embedding-002", []*genai.Content{{Parts: []*genai.Part{{Text: text}}, Role: "user"}}, &genai.EmbedContentConfig{TaskType: "SEMANTIC_SIMILARITY"})
	if err != nil {
		return nil, err
	}
	if len(res.Embeddings) == 0 {
		return nil, fmt.Errorf("no embedding returned")
	}
	return res.Embeddings[0].Values, nil
}
