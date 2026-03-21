// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"

import { RouteComponent } from "@/routes/_authenticated/talks.new"

// モックを hoisted で定義
const { mockNavigate, mockSetSteps, mockUseSearch } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSetSteps: vi.fn(),
  mockUseSearch: vi.fn(),
}))

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal() as object
  return {
    ...actual,
    createFileRoute: () => () => ({
      useNavigate: () => mockNavigate,
      useSearch: mockUseSearch,
    }),
    Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useNavigate: () => mockNavigate,
  }
})

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: () => ({ user: { uid: "test-user" } }),
}))

vi.mock("@/lib/api", () => ({
  talkClient: {
    createTalk: vi.fn(),
  },
}))

vi.mock("@/features/guide/guide-context", () => ({
  useGuide: () => ({ setSteps: mockSetSteps, steps: [] }),
}))

// 最小限のモック
vi.mock("lucide-react", () => {
  const MockIcon = (name: string) => ({ children, ...props }: any) => <span data-icon={name.toLowerCase()} {...props}>{children}</span>;
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
    MessageSquare: MockIcon("MessageSquare"),
    Leaf: MockIcon("Leaf"),
    Lightbulb: MockIcon("Lightbulb"),
    Pencil: MockIcon("Pencil"),
  };
})

vi.mock("@/features/talks/components/agent-selector", () => ({
  AGENT_PRESETS: [
    { description: 'desc', id: 'engineer', name: '若手エンジニア', icon: 'monitor' },
    { description: 'desc', id: 'grandma', name: 'おばあちゃん', icon: 'heart' },
  ],
  AgentCard: () => <div />
}))

describe("TalksNew テーマ文字数検証 (100文字)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue({ custom: "", presets: "engineer", topic: "" })
  })

  it("テーマ入力の maxLength は 100 (演出用) で、表示上の制限は 50 であること", () => {
    render(<RouteComponent />)
    const topicInput = screen.getByPlaceholderText(/例\) 新しいキャンプ用品/i)
    expect(topicInput).toHaveAttribute("maxLength", "100")

    fireEvent.change(topicInput, { target: { value: "テスト" } })
    expect(screen.getByText("3 / 50")).toBeInTheDocument()
  })
})
