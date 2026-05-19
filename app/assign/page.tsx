"use client";
import React from "react";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { useExperimentStore } from "@/lib/store";
import { getGroupSpecs } from "@/lib/groupAssignment";

export default function Assign() {
  const state = useExperimentStore();
  return (
    <Container size="md">
      <h1 className="text-2xl font-semibold mb-4">그룹 배정 (디버그)</h1>
      <Card className="p-6 text-sm font-mono">
        <p>participant_id: {state.participant_id}</p>
        <p>group: {state.group}</p>
        <p>ui_order: {state.ui_order.join(" → ")}</p>
        <p>question_order: {state.question_order.join(" → ")}</p>
        <p>interrupt_in: {state.interrupt_in}</p>
        <hr className="my-3 border-line" />
        <p className="text-xs text-muted">전체 그룹 정의:</p>
        <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(getGroupSpecs(), null, 2)}</pre>
      </Card>
    </Container>
  );
}
