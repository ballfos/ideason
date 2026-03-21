// @vitest-environment happy-dom
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import "@testing-library/jest-dom/vitest"

import { RouteComponent } from "@/routes/_authenticated/talks.new"

// モック関数の定義（巻き上げに対応）
const { mockNavigate, mockSetSteps, mockUseSearch } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSetSteps: vi.fn(),
  mockUseSearch: vi.fn(),
}))

// モックの設定
vi.mock("@/lib/api", () => ({
  talkClient: {
    createTalk: vi.fn(),
  },
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: { uid: "test-user" } }),
}))
vi.mock("@/features/auth/use-auth", () => ({
  useAuth: () => ({ user: { uid: "test-user" } }),
}))

// TanStack Router のモック (importOriginal を使用して内部エクスポートを維持)
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

vi.mock("@/features/guide/guide-context", () => ({
  useGuide: () => ({ setSteps: mockSetSteps, steps: [] }),
}))

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

// エイリアス解決のために両方モック
vi.mock("@/components/ui/page-guide", () => ({ PageGuide: () => <div /> }))
vi.mock("#/components/ui/page-guide", () => ({ PageGuide: () => <div /> }))

vi.mock("@/features/talks/components/agent-selector", () => ({
  AGENT_PRESETS: [
    { description: 'desc', id: 'engineer', name: '若手エンジニア', icon: 'monitor' },
    { description: 'desc', id: 'grandma', name: 'おばあちゃん', icon: 'heart' },
  ],
  AgentCard: ({ agent, onToggle }: { agent: { name: string }; onToggle: () => void }) => <div onClick={onToggle}>{agent.name}</div>
}))

describe("TalksNew バリデーションテスト", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearch.mockReturnValue({ custom: "", presets: "engineer", topic: "" })
  })

  afterEach(() => {
    cleanup()
  })

  it("テーマ入力の文字数制限と送信ボタンの活性状態の検証", () => {
    render(<RouteComponent />)
    const topicInput = screen.getByPlaceholderText(/例\) 新しいキャンプ用品/i)
    const submitButton = screen.getByRole("button", { name: /村へ向かう/i })

    // 初期状態は非活性
    expect(submitButton).toBeDisabled()

    // テーマ入力で活性化
    fireEvent.change(topicInput, { target: { value: "AIの未来" } })
    expect(submitButton).not.toBeDisabled()
    expect(screen.getByText("5 / 50")).toBeInTheDocument()
    expect(topicInput).toHaveAttribute("maxLength", "100")
  })
})
