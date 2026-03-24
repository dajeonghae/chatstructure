import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessageToApi } from '../services/chatbotService.js';
import {
  buildFullSnapshot,
  downloadSnapshotFile,
  loadSnapshotThunk,
} from '../utils/snapshotManager.js';
import { store } from '../redux/store.js';
import axios from 'axios';
import DialogPair from '../components/textBox/DialogPair.jsx';
import ChatInput from '../components/textBox/ChatInput.jsx';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
`;

const InnerWrapper = styled.div`
  width: 100%;
  max-width: 860px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px 30px 70px 30px;
  box-sizing: border-box;
`;

const ChatInputWrapper = styled.div`
  margin-left: 15px;
  width: calc(100% - 0px);
`;

const MessagesContainer = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow-y: auto;
  scrollbar-width: none;
`;

const TopButtonContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
`;

const SaveButton = styled.button`
  padding: 8px 12px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const ExportButton = styled(SaveButton)`
  background-color: #2d3748;
`;

const ImportButton = styled(SaveButton)`
  background-color: #ffffff;
  color: #2d3748;
  border: 1px solid #2d3748;
`;

function ChatOnly() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef(null);
  const messageRefs = useRef([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const activeNodeIds = useSelector((state) => state.node.activeNodeIds);
  const currentNodeId = activeNodeIds[activeNodeIds.length - 1] || 'root';

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    setIsLoading(true);

    const userMessage = {
      role: 'user',
      content: input,
      nodeId: currentNodeId,
      number: messages.length + 1,
    };

    let updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setInput('');
    setIsExpanded(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }

    try {
      const gptMessageContent = await dispatch(sendMessageToApi(input, updatedMessages));
      const gptMessage = {
        role: 'assistant',
        content: gptMessageContent,
        nodeId: currentNodeId,
        number: updatedMessages.length + 1,
      };

      updatedMessages = [...updatedMessages, gptMessage];
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) return;
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);

    e.target.style.height = '40px';
    const currentScrollHeight = e.target.scrollHeight;

    if (currentScrollHeight > 45) {
      setIsExpanded(true);
      e.target.style.height = `${currentScrollHeight}px`;
    } else {
      setIsExpanded(false);
      e.target.style.height = '40px';
    }
  };

  const handleExportSnapshot = () => {
    const reduxState = store.getState();
    const snapshot = buildFullSnapshot(reduxState, messages);
    downloadSnapshotFile(snapshot);
  };

  const handleImportSnapshot = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const { messages: restored } = await dispatch(loadSnapshotThunk(file));
      setMessages(restored || []);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
      alert('📦 스냅샷 복원 완료!(JSON)');
    } catch (err) {
      console.error(err);
      alert('❌ 스냅샷 불러오기 실패 (콘솔 확인)');
    }
  };

  const handleLoadFromServer = async () => {
    try {
      const r = await axios.get('http://localhost:8080/api/chatgraph/get');
      const snap = r.data?.snapshot;
      if (!snap) throw new Error('no snapshot returned');

      const { messages: restored } = await dispatch(loadSnapshotThunk(snap));
      setMessages(restored || []);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);

      alert('♻️ 서버에서 스냅샷 불러오기 완료 (chatgraph.json)');
    } catch (e) {
      console.error(e);
      alert('❌ 서버 불러오기 실패 (콘솔 확인)');
    }
  };

  const pairedMessages = [];
  for (let i = 0; i < messages.length; i += 2) {
    pairedMessages.push({
      userMsg: messages[i],
      aiMsg: messages[i + 1],
      userIndex: i,
      aiIndex: i + 1,
    });
  }

  return (
    <Container>
      <InnerWrapper>
      <MessagesContainer>
        {pairedMessages.map((pair, index) => (
          <DialogPair
            key={index}
            userMsg={pair.userMsg}
            aiMsg={pair.aiMsg}
            userRef={(el) => { messageRefs.current[pair.userIndex] = el; }}
            aiRef={(el) => { if (pair.aiMsg) messageRefs.current[pair.aiIndex] = el; }}
          />
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <TopButtonContainer>
        <ExportButton onClick={handleExportSnapshot}>Export</ExportButton>
        <ImportButton onClick={handleLoadFromServer}>Import</ImportButton>
        <input
          type="file"
          ref={fileInputRef}
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleImportSnapshot}
        />
      </TopButtonContainer>

      <ChatInputWrapper>
        <ChatInput
          input={input}
          isLoading={isLoading}
          isExpanded={isExpanded}
          textareaRef={textareaRef}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
        />
      </ChatInputWrapper>
      </InnerWrapper>
    </Container>
  );
}

export default ChatOnly;
