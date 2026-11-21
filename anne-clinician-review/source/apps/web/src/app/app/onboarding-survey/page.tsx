"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getOnboardingSurvey,
  submitOnboardingSurvey,
  type SurveyAnswerRequest,
  type SurveyQuestion,
} from "@vescent/shared";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const answerFor = (question: SurveyQuestion, value: SurveyAnswerRequest["value"]): SurveyAnswerRequest => ({
  questionId: question.id,
  questionType: question.questionType,
  value,
});

export default function OnboardingSurveyPage() {
  const router = useRouter();
  const { user, token, setAuth } = useAuthStore();
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswerRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: survey, isLoading } = useQuery({
    queryKey: ["onboarding-survey"],
    queryFn: getOnboardingSurvey,
  });

  const goBack = () => {
    if (!started) return;
    if (questionIndex > 0) {
      setQuestionIndex((current) => current - 1);
      return;
    }
    setStarted(false);
  };

  const submitSurvey = async (nextAnswers: Record<string, SurveyAnswerRequest>) => {
    if (!survey || !user || !token) return;
    const payloadAnswers = survey.questions.map((question) =>
      nextAnswers[question.id] ?? answerFor(question, question.questionType === "tag_select" ? [] : null),
    );
    setIsSubmitting(true);
    try {
      const nextUser = await submitOnboardingSurvey({
        surveyVersion: survey.version,
        surveyAnswers: payloadAnswers,
      });
      setAuth(token, nextUser);
      router.push("/app/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save answers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueFromQuestion = (nextAnswers: Record<string, SurveyAnswerRequest>) => {
    if (!survey) return;
    if (questionIndex < survey.questions.length - 1) {
      setAnswers(nextAnswers);
      setQuestionIndex((current) => current + 1);
    } else {
      submitSurvey(nextAnswers);
    }
  };

  if (!started) {
    return (
      <Card className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Let's get you matched with the perfect mentors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Answer a few quick questions so admins can understand what kind of support will fit you best.
          </p>
          <Button type="button" onClick={() => setStarted(true)} disabled={isLoading || !survey}>
            {isLoading ? "Loading..." : "Next"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = survey?.questions[questionIndex];
  if (!question || !survey) return null;
  const currentAnswer = answers[question.id];
  const selectedTags = Array.isArray(currentAnswer?.value) ? currentAnswer.value : [];
  const textValue = typeof currentAnswer?.value === "string" ? currentAnswer.value : "";

  return (
    <Card className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{question.section}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 space-y-4 overflow-y-auto">
        <p className="font-medium">{question.prompt}</p>

        {question.questionType === "single_choice" ? (
          <div className="space-y-2">
            {question.options.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={currentAnswer?.value === option.id ? "default" : "outline"}
                className="h-auto min-h-11 w-full justify-start whitespace-normal px-4 py-3 text-left leading-5"
                onClick={() => {
                  const nextAnswers = { ...answers, [question.id]: answerFor(question, option.id) };
                  setAnswers(nextAnswers);
                  continueFromQuestion(nextAnswers);
                }}
                disabled={isSubmitting}
              >
                {option.label}
              </Button>
            ))}
          </div>
        ) : null}

        {question.questionType === "tag_select" ? (
          <>
            <div className="space-y-2">
              {question.options.map((option) => {
                const selected = selectedTags.includes(option.id);
                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    className="h-auto min-h-11 w-full justify-start whitespace-normal px-4 py-3 text-left leading-5"
                    onClick={() => {
                      const nextTags = selected
                        ? selectedTags.filter((tag) => tag !== option.id)
                        : option.id === "none_of_these"
                          ? [option.id]
                          : [...selectedTags.filter((tag) => tag !== "none_of_these"), option.id];
                      setAnswers({ ...answers, [question.id]: answerFor(question, nextTags) });
                    }}
                    disabled={isSubmitting}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <Button
              type="button"
              onClick={() => continueFromQuestion({
                ...answers,
                [question.id]: answerFor(question, selectedTags),
              })}
              disabled={isSubmitting}
            >
              Continue
            </Button>
          </>
        ) : null}

        {question.questionType === "open_response" ? (
          <>
            <textarea
              value={textValue}
              onChange={(event) => setAnswers({ ...answers, [question.id]: answerFor(question, event.target.value) })}
              placeholder="Share anything you'd like us to know"
              rows={5}
              className="flex min-h-32 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              <Button type="button" onClick={() => continueFromQuestion(answers)} disabled={isSubmitting}>
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => continueFromQuestion({ ...answers, [question.id]: answerFor(question, null) })}
                disabled={isSubmitting}
              >
                Skip
              </Button>
            </div>
          </>
        ) : null}

        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={goBack}>Back</Button>
        </div>
      </CardContent>
    </Card>
  );
}
