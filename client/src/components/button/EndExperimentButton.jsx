import { useState } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 1000;
  padding: 10px 18px;
  background: #e11d48;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: background 0.2s;

  &:hover {
    background: #be123c;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #373d47;
  text-align: center;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 11px;
  background: #f1f3f5;
  color: #575a5e;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e2e5e9;
  }
`;

const ConfirmBtn = styled.button`
  flex: 1;
  padding: 11px;
  background: #e11d48;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #be123c;
  }
`;

function EndExperimentButton({ onEnd }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onEnd();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>실험 종료</Button>

      {open && (
        <Overlay>
          <Modal>
            <ModalTitle>실험을 종료하시겠습니까?</ModalTitle>
            <ModalButtons>
              <CancelBtn onClick={() => setOpen(false)}>취소</CancelBtn>
              <ConfirmBtn onClick={handleConfirm}>확인</ConfirmBtn>
            </ModalButtons>
          </Modal>
        </Overlay>
      )}
    </>
  );
}

export default EndExperimentButton;
