import { useState } from "react";
import styled from "styled-components";

const IndexWrapper = styled.div`
  width: 60px;
  height: 90%;
  padding: 20px 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  margin-left: 10px;
`;

const Track = styled.div`
  position: relative;
  width: 4px;
  height: 100%;
  background-color: #E2E8F0;
  border-radius: 2px;
`;

const SegmentHighlight = styled.div`
  position: absolute;
  left: 0;
  width: 4px;
  border-radius: 2px;
  background-color: ${(props) => props.color};
  z-index: 1;
  box-shadow: 0 0 4px ${(props) => props.color};
`;

const MarkerRow = styled.div`
  position: absolute;
  left: -4px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 5;
`;

const TopicMarker = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color || "#333"};
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  outline: ${(props) => props.$selected ? `2px solid ${props.color}` : "none"};
  outline-offset: 2px;
`;

const TopicLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${(props) => props.color || "#333"};
  white-space: nowrap;
  pointer-events: none;
`;

const ProgressArrow = styled.div`
  position: absolute;
  left: -11px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 8px solid #c92a2a;
  transition: top 0.1s ease-out;
  z-index: 10;
`;

const ChatIndex = ({ scrollPercent, markers = [], onMarkerClick }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const selectedMarker = markers.find((m) => m.nodeId === selectedNodeId);

  const segmentRanges = (() => {
    const segs = selectedMarker?.segments;
    if (!segs || segs.length === 0) return [];
    return segs.map((s) => ({
      top: s.topPercent,
      height: Math.max((s.bottomPercent ?? s.topPercent) - s.topPercent, 0.5),
    }));
  })();

  const handleMarkerClick = (marker) => {
    if (selectedNodeId === marker.nodeId) {
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(marker.nodeId);
      onMarkerClick?.(marker.messageIndex);
    }
  };

  return (
    <IndexWrapper>
      <Track>
        {segmentRanges.map((seg, i) => (
          <SegmentHighlight
            key={i}
            style={{ top: `${seg.top}%`, height: `${seg.height}%` }}
            color={selectedMarker.color}
          />
        ))}

        {markers.map((marker) => (
          <MarkerRow
            key={marker.nodeId}
            style={{ top: `${marker.topPercent}%` }}
            onClick={() => handleMarkerClick(marker)}
          >
            <TopicMarker
              color={marker.color}
              $selected={selectedNodeId === marker.nodeId}
            />
            <TopicLabel color={marker.color}>{marker.keyword}</TopicLabel>
          </MarkerRow>
        ))}

        <ProgressArrow style={{ top: `${scrollPercent}%` }} />
      </Track>
    </IndexWrapper>
  );
};

export default ChatIndex;
