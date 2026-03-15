import React from 'react';
import styled from 'styled-components';

const IndexWrapper = styled.div`
  width: 60px;
  height: 100%;
  padding: 20px 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  margin-left: 10px;
`;

const Track = styled.div`
  position: relative;
  width: 2px;
  height: 100%;
  background-color: #E2E8F0;
  border-radius: 2px;
`;

const ProgressArrow = styled.div`
  position: absolute;
  left: -12px; /* 선을 향해 가리키도록 위치 조정 */
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 8px solid #c92a2a; /* 빨간색 화살표 */
  transition: top 0.1s ease-out;
`;

const ChatIndex = ({ scrollPercent }) => {
  return (
    <IndexWrapper>
      <Track>
        {/* scrollPercent에 따라 화살표의 상하 위치가 결정됩니다 */}
        <ProgressArrow style={{ top: `${scrollPercent}%` }} />
      </Track>
    </IndexWrapper>
  );
};

export default ChatIndex;