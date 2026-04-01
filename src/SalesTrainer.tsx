import React, { useState, useRef, useEffect } from "react";
import {
  Layout,
  Menu,
  Input,
  Button,
  Card,
  Typography,
  Spin,
  message,
  Avatar,
} from "antd";
import {
  BookOutlined,
  MessageOutlined,
  DashboardOutlined,
  UserOutlined,
  SendOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// --- Dữ liệu Context giả định cho từng phân hệ ---
const MODULE_CONTEXTS: Record<string, string> = {
  knowledge:
    "Bạn là chuyên gia đào tạo kiến thức sản phẩm. Hãy cung cấp thông tin về USP, chân dung khách hàng, và so sánh đối thủ một cách chi tiết, dễ hiểu.",
  playbook:
    "Bạn là một huấn luyện viên thực chiến. Hãy đóng vai khách hàng hoặc đưa ra các mẫu kịch bản chốt sale, xử lý từ chối khéo léo, ấm áp và chuyên nghiệp.",
  evaluation:
    "Bạn là giám khảo đánh giá kỹ năng bán hàng. Dựa trên thông tin người dùng cung cấp, hãy chấm điểm và đưa ra nhận xét về kỹ năng lắng nghe, đặt câu hỏi.",
  learner:
    "Bạn là trợ lý học tập cá nhân. Hãy tư vấn lộ trình học bán hàng dựa trên mức độ kinh nghiệm và mục tiêu của học viên.",
};

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

const SalesTrainer: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>("playbook");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Bơm context của phân hệ hiện tại vào prompt để AI trả lời đúng trọng tâm
      const systemContext = MODULE_CONTEXTS[activeModule];
      const fullPrompt = `System: ${systemContext}\n\nUser: ${newUserMsg.content}`;

      const response = await axios.post(
        "https://groqprompt.netlify.app/api/result",
        {
          prompt: fullPrompt,
        },
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          response.data.result || "Không nhận được phản hồi từ hệ thống.",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("API Error:", error);
      message.error("Có lỗi xảy ra khi kết nối với máy chủ AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        width={260}
        theme="light"
        style={{
          borderRight: "1px solid #f0f0f0",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ padding: "24px 16px", textAlign: "center" }}>
          <Title
            level={4}
            style={{ margin: 0, color: "#1890ff", fontFamily: "Lexend Deca" }}
          >
            SaleMaster AI
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Training Platform
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeModule]}
          onClick={(e) => setActiveModule(e.key)}
          style={{ borderRight: 0 }}
          items={[
            {
              key: "knowledge",
              icon: <BookOutlined />,
              label: "Kiến thức Nền tảng",
            },
            {
              key: "playbook",
              icon: <MessageOutlined />,
              label: "Kịch bản & Tình huống",
            },
            {
              key: "evaluation",
              icon: <DashboardOutlined />,
              label: "Khung Đánh giá",
            },
            {
              key: "learner",
              icon: <UserOutlined />,
              label: "Lộ trình Cá nhân",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Phân hệ:{" "}
            {activeModule === "knowledge"
              ? "Kiến thức"
              : activeModule === "playbook"
                ? "Kịch bản"
                : activeModule === "evaluation"
                  ? "Đánh giá"
                  : "Cá nhân hóa"}
          </Title>
        </Header>

        <Content
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#f8fafc",
            padding: "24px",
          }}
        >
          {/* Khu vực hiển thị tin nhắn */}
          <Card
            style={{
              flex: 1,
              overflow: "auto",
              marginBottom: "16px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
            styles={{ body: { padding: "24px", height: "100%" } }}
            className="chat-container"
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "100px",
                  color: "#94a3b8",
                }}
              >
                <RobotOutlined
                  style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                    color: "#bae0ff",
                  }}
                />
                <br />
                Hãy bắt đầu cuộc trò chuyện hoặc yêu cầu huấn luyện!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "20px",
                  }}
                >
                  {msg.role === "ai" && (
                    <Avatar
                      icon={<RobotOutlined />}
                      style={{
                        backgroundColor: "#1890ff",
                        marginRight: "12px",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "12px 16px",
                      backgroundColor:
                        msg.role === "user" ? "#1890ff" : "#ffffff",
                      color: msg.role === "user" ? "#fff" : "#0f172a",
                      borderRadius: "12px",
                      border: msg.role === "ai" ? "1px solid #e2e8f0" : "none",
                      boxShadow:
                        msg.role === "ai"
                          ? "0 2px 4px rgba(0,0,0,0.02)"
                          : "none",
                    }}
                  >
                    {msg.role === "user" ? (
                      <Text style={{ color: "#fff" }}>{msg.content}</Text>
                    ) : (
                      <div
                        className="markdown-body"
                        style={{ fontSize: "14px", lineHeight: "1.6" }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <Avatar
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: "#52c41a",
                        marginLeft: "12px",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "20px",
                }}
              >
                <Avatar
                  icon={<RobotOutlined />}
                  style={{ backgroundColor: "#1890ff", marginRight: "12px" }}
                />
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Spin size="small" />{" "}
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Đang phân tích...
                  </Text>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </Card>

          {/* Khu vực nhập liệu */}
          <div style={{ display: "flex", gap: "12px" }}>
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập tình huống hoặc câu hỏi của bạn (Shift + Enter để xuống dòng)..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ borderRadius: "8px", fontSize: "15px" }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={isLoading}
              style={{ height: "auto", borderRadius: "8px", padding: "0 24px" }}
            >
              Gửi
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SalesTrainer;
