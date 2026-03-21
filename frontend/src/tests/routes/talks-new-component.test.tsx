// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import "@testing-library/jest-dom/vitest"

// 最小限のモック
vi.mock("lucide-react", () => {
  const MockIcon = (name: string) => ({ children, ...props }: any) => <span data-icon={name} {...props}>{children}</span>;
  return {
    Monitor: MockIcon("Monitor"),
    CakeSlice: MockIcon("CakeSlice"),
    Brush: MockIcon("Brush"),
    Candy: MockIcon("Candy"),
    Calculator: MockIcon("Calculator"),
    Hamburger: MockIcon("Hamburger"),
    Building: MockIcon("Building"),
    Smile: MockIcon("Smile"),
    Heart: MockIcon("Heart"),
    Crown: MockIcon("Crown"),
    ChevronDown: MockIcon("ChevronDown"),
    ChevronUp: MockIcon("ChevronUp"),
    Trash2: MockIcon("Trash2"),
    User: MockIcon("User"),
    X: MockIcon("X"),
    Plus: MockIcon("Plus"),
    Loader2: MockIcon("Loader2"),
    ArrowLeft: MockIcon("ArrowLeft"),
    HelpCircle: MockIcon("HelpCircle"),
    Pencil: MockIcon("Pencil"),
  };
})

import { AgentCard } from "@/features/talks/components/agent-selector"

describe("AgentCard バリデーションテスト", () => {
  const mockAgent = {
    description: 'テスト用の役割説明です。',
    id: 'test-agent',
    name: 'テストエージェント'
  }

  it("名前と役割に正しい maxLength が設定されていること", () => {
    // isOpen=true でレンダリングして入力を表示させる
    render(
      <AgentCard
        agent={mockAgent}
        isOpen={true}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onApplyPreset={vi.fn()}
        onRemove={vi.fn()}
        showRemove={true}
      />
    )

    const nameInput = screen.getByDisplayValue(mockAgent.name)
    const descInput = screen.getByDisplayValue(mockAgent.description)

    expect(nameInput).toHaveAttribute("maxLength", "15")
    expect(descInput).toHaveAttribute("maxLength", "100")
  })

  it("名前と役割の文字数カウントが正しく表示されること", () => {
    render(
      <AgentCard
        agent={mockAgent}
        isOpen={true}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onApplyPreset={vi.fn()}
        onRemove={vi.fn()}
        showRemove={true}
      />
    )

    // 「テストエージェント」は9文字
    expect(screen.getByText("9 / 15")).toBeInTheDocument()
    // 「テスト用の役割説明です。」は12文字
    expect(screen.getByText("12 / 100")).toBeInTheDocument()
  })
})
