
"use client";

import { useState } from "react";
import { useToast } from "@/components/toast-provider";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  mode?: "mock" | "live";
};

type CookingAssistantProps = {
  recipeId: number;
  recipeTitle: string;
};

export default function CookingAssistant({
  recipeId,
  recipeTitle,
}: CookingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/recipes/${recipeId}/assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: trimmedQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to get a cooking response."
        );
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.answer,
        mode: data.mode,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="cooking-assistant">
      <header className="cooking-assistant__header">
        <div>
          <h2>Cooking Assistant</h2>
          <p>
            Need help with {recipeTitle}? Ask a cooking question.
          </p>
        </div>

        <span className="cooking-assistant__badge">
          Development mode
        </span>
      </header>

      <div
        className="cooking-assistant__messages"
        aria-live="polite"
        aria-label="Cooking assistant conversation"
      >
        {messages.length === 0 && (
          <div className="cooking-assistant__empty">
            <p>What would you like to know about this recipe?</p>

            <p>
              Try asking about ingredient substitutions,
              pepper levels, cooking time, or servings.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <article
            key={message.id}
            className={`cooking-assistant__message cooking-assistant__message--${message.role}`}
          >
            <strong>
              {message.role === "user" ? "You" : "ChopLingo"}
            </strong>

            <p>{message.content}</p>

            {message.mode === "mock" && (
              <small>Simulated development response</small>
            )}
          </article>
        ))}

        {loading && (
          <p className="cooking-assistant__loading">
            ChopLingo is preparing a response...
          </p>
        )}
      </div>

      <form
        className="cooking-assistant__form"
        onSubmit={handleSubmit}
      >
        <label htmlFor="cooking-question">
          Ask a question
        </label>

        <textarea
          id="cooking-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="E.g. How can I make this recipe less spicy?"
          maxLength={500}
          rows={3}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || question.trim().length < 3}
        >
          {loading ? "Sending..." : "Ask assistant"}
        </button>
      </form>
    </section>
  );
}
