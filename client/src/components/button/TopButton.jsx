import React from "react";
import styled from "styled-components";

const ArrowContainer = styled.div`
  position: absolute;
  bottom: -45px;
  right: -150px;
  margin: 0px 100px 50px 0px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  z-index: 100;
`;

const ArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: #ffffff;
  color: white;
  border: 1px solid rgba(217, 217, 217, 0.8);
  border-radius: 50%;
  cursor: pointer;
  opacity: ${(props) => (props.disabled ? 0.2 : 1)};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

function TopButton({ activeDialogNumbers, currentScrolledDialog, onMove }) {
  if (!activeDialogNumbers.length) return null;

  const sortedDialogs = [...activeDialogNumbers].sort((a, b) => a - b);
  const currentIndex = sortedDialogs.indexOf(currentScrolledDialog);

  return (
    <ArrowContainer>
      <ArrowButton onClick={() => onMove(-1)} disabled={currentIndex <= 0}>
        <span
          className="material-symbols-outlined md-black-font md-30"
          style={{ userSelect: "none" }}
        >
          keyboard_arrow_up
        </span>
      </ArrowButton>

      <ArrowButton
        onClick={() => onMove(1)}
        disabled={currentIndex >= sortedDialogs.length - 1}
      >
        <span
          className="material-symbols-outlined md-black-font md-30"
          style={{ userSelect: "none" }}
        >
          keyboard_arrow_down
        </span>
      </ArrowButton>
    </ArrowContainer>
  );
}

export default TopButton;