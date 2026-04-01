import React from "react";
import { ConfigProvider } from "antd";
import SalesTrainer from "./SalesTrainer";
import "./App.css";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1", // Indigo hiện đại
          borderRadius: 12,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          colorTextBase: "#0f172a",
        },
        components: {
          Layout: {
            bodyBg: "#f8fafc",
            headerBg: "#ffffff",
            siderBg: "#ffffff",
          },
          Menu: {
            itemSelectedBg: "#eef2ff",
            itemSelectedColor: "#6366f1",
          },
        },
      }}
    >
      <SalesTrainer />
    </ConfigProvider>
  );
};

export default App;
