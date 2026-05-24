"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { BLUFBox } from "@/components/BLUFBox";
import { ChunkCard } from "@/components/ChunkCard";
import { useExperimentStore } from "@/lib/store";

const DEMO_BLUF =
  "이것은 연습용 화면입니다. 실제 실험과 동일한 UI 요소를 미리 체험해보고, 준비되면 실험을 시작하세요.";

const DEMO_CHUNKS = [
  {
    order: 1,
    title: "이 카드가 섹션입니다",
    analogy: "비유 박스는 이렇게 점선 테두리로 표시됩니다. 개념을 친숙한 예시로 먼저 설명합니다.",
    body: "한 섹션에는 하나의 소주제가 담깁니다. 섹션 제목을 클릭하면 펼치고 접을 수 있습니다.",
    transition: "다음 섹션도 펼쳐보세요",
  },
  {
    order: 2,
    title: "기본은 접혀 있습니다",
    analogy: "필요할 때 하나씩 펼쳐 읽으면 됩니다.",
    body: "모든 섹션은 접힌 상태로 시작합니다. 위에서부터 순서대로 펼쳐 읽는 것을 권장합니다.",
    transition: "마지막 섹션입니다",
  },
  {
    order: 3,
    title: "북마크 기능",
    analogy: "읽던 위치를 표시해두면 인터럽션 후에도 빠르게 돌아올 수 있습니다.",
    body: "각 섹션 안의 '여기까지 읽었어요' 버튼을 누르면 오른쪽 사이드바에 표시됩니다.",
    transition: "",
  },
];

export default function Practice() {
  const router = useRouter();
  const ui_order = useExperimentStore((s) => s.ui_order);
  const question_order = useExperimentStore((s) => s.question_order);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const [bm, setBm] = useState<Record<number, boolean>>({});

  const startReal = () => {
    router.push(`/reading?q=${question_order[0]}&ui=${ui_order[0]}&phase=1`);
  };

  return (
    <Container size="lg">
      <Stepper step={3} total={8} />
      <h1 className="text-2xl font-semibold mb-2">연습</h1>
      <p className="text-muted mb-6">
        본 실험에서 사용할 인터페이스를 미리 익혀봅니다. 데이터는 기록되지 않습니다.
      </p>

      <BLUFBox text={DEMO_BLUF} />

      <div className="space-y-3">
        {DEMO_CHUNKS.map((c) => (
          <ChunkCard
            key={c.order}
            order={c.order}
            total={DEMO_CHUNKS.length}
            title={c.title}
            analogy={c.analogy}
            body={c.body}
            transition={c.transition}
            open={!!openMap[c.order]}
            bookmarked={!!bm[c.order]}
            onToggle={() => setOpenMap((p) => ({ ...p, [c.order]: !p[c.order] }))}
            onBookmark={() => setBm((p) => ({ ...p, [c.order]: !p[c.order] }))}
          />
        ))}
      </div>

      <Card className="p-6 mt-8 bg-accent-50 border-accent-100">
        <h2 className="font-semibold mb-2">준비됐나요?</h2>
        <p className="text-sm text-muted mb-4">
          이제 본 실험을 시작합니다. 화면에 표시되는 응답을 읽고, 이후 짧은 퀴즈를 풀게 됩니다.
        </p>
        <Button onClick={startReal}>실험 시작 →</Button>
      </Card>
    </Container>
  );
}
