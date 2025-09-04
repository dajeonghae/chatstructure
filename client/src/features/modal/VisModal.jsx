import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ModalPortal from "../../ModalPortal";
import { useDispatch } from "react-redux";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const CloseButton = styled.button`
  float: right;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ReplayButton = styled.button`
  margin-top: 12px;
  padding: 10px 16px;
  background-color: #373d47;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #373d47;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const VisModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const currentNodeId = "root"; // 테스트용 기본 ID

  const handleReplayClick = async () => {
    setLoading(true);
    // 시각화 시작 신호(선택)
    window.dispatchEvent(new CustomEvent("vis:start"));
    // 리플레이 시작
    window.dispatchEvent(new CustomEvent("chat:replay", { detail: { text } }));
  };

  useEffect(() => {
    const onDone = () => {
      setLoading(false);
      onClose(); // 시각화 완료 시 모달 자동 닫기
    };
    window.addEventListener("vis:done", onDone);
    return () => window.removeEventListener("vis:done", onDone);
  }, [onClose]);

  return (
    <ModalPortal>
      <ModalOverlay
        isOpen={isOpen}
        onClick={() => {
          if (!loading) onClose();
        }}
      >
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}>×</CloseButton>
          <h3>Paste your conversation history below:</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              height: "200px",
              marginTop: "12px",
              padding: "10px",
              fontSize: "1rem",
              fontFamily: "inherit",
              borderRadius: "8px",
              border: "1px solid #ccc",
              resize: "vertical",
            }}
            placeholder={`User: ...\nAssistant: ...`}
          />
          <ReplayButton onClick={handleReplayClick} disabled={loading}>
            {loading ? "로딩..." : "▶ 대화 재생"}
          </ReplayButton>

          {loading && (
            <LoadingOverlay>
              <Spinner />
            </LoadingOverlay>
          )}
        </ModalContent>
      </ModalOverlay>
    </ModalPortal>
  );
};

export default VisModal;
