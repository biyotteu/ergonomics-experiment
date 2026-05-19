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

const DEMO_BLUF = [
  "이건 연습용 화면입니다. 실제 실험과 동일한 UI 요소를 미리 체험합니다.",
  "청크 카드를 클릭해 펼치고/접고, 북마크 버튼도 한 번 눌러보세요.",
  "준비됐다고 느끼면 아래 '실험 시작' 버튼을 누르세요.",
];

const DEMO_CHUNKS = [
  { order: 1, title: "이 카드가 청크입니다", body: "여기처럼 한 청크에는 하나의 소주제가 담깁니다. 본문 끝의 화살표로 다음 청크 안내가 표시됩니다.", transition: "다음 카드를 펼쳐보세요" },
  { order: 2, title: "기본은 접혀 있습니다", body: "두 번째부터는 접힌 상태로 시작합니다. 헤더를 클릭해 펼치고, 끝나면 다시 닫아도 됩니다.", transition: "마지막 카드입니다" },
  { order: 3, title: "북마크 기능", body: "각 청크 안에 있는 북마크 버튼을 누르면 우측 사이드바에 표시됩니다. 인터럽션이 발생한 후에도 빠르게 돌아올 수 있어요.", transition: "" },
];

export default function Practice() {
  const router = useRouter();
  const ui_order = useExperimentStore((s) => s.ui_order);
  const question_order = useExperimentStore((s) => s.question_order);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({ 1: true });
  const [bm, setBm] = useState<Record<number, boolean>>({});

  const startReal = () => {
    const firstQ = question_order[0];
    const firstUI = ui_order[0];
    router.push(`/reading?q=${firstQ}&ui=${firstUI}&phase=1`);
  };

  return (
    <Container size="lg">
      <Stepper step={3} total={8} />
      <h1 className="text-2xl font-semibold mb-2">연습</h1>
      <p className="text-muted mb-6">
        본 실험에서 사용할 인터페이스를 미리 익혀봅니다. 데이터는 기록되지 않습니다.
      </p>

      <BLUFBox bullets={DEMO_BLUF} />

      <div className="space-y-3">
        {DEMO_CHUNKS.map((c, idx) => (
          <ChunkCard
            key={c.order}
            order={c.order}
            total={DEMO_CHUNKS.length}
            title={c.title}
            body={c.body}
            transition={c.transition}
            open={!!openMap[c.order]}
            bookmarked={!!bm[c.order]}
            onToggle={() => setOpenMap((p) => ({ ...p, [c.order]: !p[c.order] }))}
            onBookmark={() => setBm((p) => ({ ...p, [c.order]: !p[c.order] }))}
            remaining={DEMO_CHUNKS.length - idx - 1}
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
