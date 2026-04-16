import { api } from "@/lib/api";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
type Question = {
  id: string;
  type: string;
  prompt: string;
  options?: string[];
  correctAnswer: any;
};

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await api.get(`/lessons/${lessonId}/quiz`);
        // console.log("QUIZ API:", res.data);

        setQuestions(res.data.data.questions || []);
      } catch (err) {
        // console.log("Quiz load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) loadQuiz();
  }, [lessonId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {questions.map((q, index) => (
        <View key={q.id} style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold" }}>
            {index + 1}. {q.prompt}
          </Text>

          {q.type === "multiple_choice" &&
            q.options?.map((opt, i) => (
              <Pressable
                key={i}
                style={{
                  padding: 10,
                  marginTop: 5,
                  backgroundColor: "#eee",
                  borderRadius: 8,
                }}
              >
                <Text>{opt}</Text>
              </Pressable>
            ))}

          {q.type === "text_input" && (
            <Text style={{ marginTop: 10 }}>
              ✍️ User answer input (дараа хийнэ)
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
