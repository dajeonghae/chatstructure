import { memo } from "react";
import { Handle, Position } from "reactflow";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { setHoveredNodes, clearHoveredNodes } from "../../redux/slices/modeSlice";
import { toggleActiveNode, setSelectedIndexNode } from "../../redux/slices/nodeSlice";
import { COLORS } from "../../styles/colors";
import { trackNodeInteraction } from "../../services/trackingService";

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NodeContent = styled.div`
  padding: 10px 20px;
  border-radius: 20px;
  background: ${(props) =>
    props.isActive && props.isContextMode
      ? "#606368"
      : props.isHovered
      ? "#A0AEC0"
      : props.isContextMode
      ? "rgba(217, 217, 217, 0.4)"
      : "#fff"};
  color: ${(props) =>
    props.isActive && props.isContextMode
      ? "white"
      : props.isActive
      ? props.darkerColor || COLORS.dark_grey_font
      : COLORS.dark_grey_font};
  text-align: center;
  border: 1px solid
    ${(props) =>
      props.isActive
        ? props.borderColor || "#48BB78"
        : "#d9d9d9"};
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.3s;
  opacity: ${(props) => (props.isContextMode && !props.isActive ? 0.3 : 1)};
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 600;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
`;

// 부모 노드를 모두 가져오는 함수
const getAllParentNodes = (nodeId, nodesData) => {
  let currentNode = nodesData[nodeId];
  const parentNodes = [];

  while (currentNode && currentNode.parent && currentNode.parent !== "root") {
    if (!nodesData[currentNode.parent]) break;
    parentNodes.push(currentNode.parent);
    currentNode = nodesData[currentNode.parent];
  }

  return parentNodes.reverse();
};

// 자식 노드를 모두 가져오는 함수
const getAllChildNodes = (nodeId, nodesData) => {
  const childNodes = [];
  const queue = [nodeId];

  while (queue.length) {
    const currentId = queue.shift();
    const currentNode = nodesData[currentId];
    if (!currentNode) continue;
    childNodes.push(currentId);
    currentNode.children.forEach((childId) => queue.push(childId));
  }

  return childNodes;
};

const TooltipNode = ({ data, id }) => {
  const dispatch = useDispatch();
  const linearMode = useSelector((state) => state.mode.linearMode);
  const treeMode = useSelector((state) => state.mode.treeMode);
  const contextMode = useSelector((state) => state.mode.contextMode);
  const hoveredNodeIds = useSelector((state) => state.mode.hoveredNodeIds);
  const activeNodeIds = useSelector((state) => state.node.activeNodeIds);
  const nodesData = useSelector((state) => state.node.nodes);

  const isHovered = hoveredNodeIds.includes(id);
  const isActive = activeNodeIds.includes(id);

  const handleMouseEnter = () => {
    if (linearMode) {
      const parentNodes = getAllParentNodes(id, nodesData);
      dispatch(setHoveredNodes([...parentNodes, id]));
    } else if (treeMode) {
      dispatch(setHoveredNodes(getAllChildNodes(id, nodesData)));
    }
  };

  const handleMouseLeave = () => {
    if (linearMode || treeMode) dispatch(clearHoveredNodes());
  };

  const handleClick = (event) => {
    event.stopPropagation();
    trackNodeInteraction();
    if ((linearMode || treeMode) && hoveredNodeIds.length > 0) {
      if (contextMode) {
        hoveredNodeIds.forEach((id) => dispatch(toggleActiveNode(id)));
      } else {
        const allAlreadyActive = hoveredNodeIds.every((id) => activeNodeIds.includes(id));
        if (allAlreadyActive) {
          // 같은 선택 다시 클릭 → 해제
          hoveredNodeIds.forEach((id) => dispatch(toggleActiveNode(id)));
        } else {
          // 새 선택 → 기존 전부 해제 후 새로 활성화
          dispatch(setSelectedIndexNode(null));
          activeNodeIds.forEach((id) => dispatch(toggleActiveNode(id)));
          hoveredNodeIds.forEach((id) => dispatch(toggleActiveNode(id)));
        }
      }
    } else if (contextMode) {
      dispatch(toggleActiveNode(id));
    } else {
      // node 모드: 단일 선택
      dispatch(setSelectedIndexNode(null));
      if (!isActive) {
        activeNodeIds.forEach((activeId) => dispatch(toggleActiveNode(activeId)));
      }
      dispatch(toggleActiveNode(id));
    }
  };

  return (
    <TooltipContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
      <NodeContent isHovered={isHovered} isActive={isActive} isContextMode={contextMode} borderColor={data.color} darkerColor={data.darkerColor}>
        {data.label}
      </NodeContent>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: data.isIndexHighlighted !== false ? data.color : "#BEBEBE", transition: "background 0.2s ease" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: data.isIndexHighlighted !== false ? data.color : "#BEBEBE", transition: "background 0.2s ease" }}
      />
    </TooltipContainer>
  );
};

export default memo(TooltipNode);
