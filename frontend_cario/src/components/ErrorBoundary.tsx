import React, { Component, ErrorInfo } from 'react';
import styled from '@emotion/styled';

const ErrorContainer = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  margin: 10px 0;
`;

const ReloadButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }
`;

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorMessage>
            Có lỗi xảy ra. Vui lòng thử lại sau.
          </ErrorMessage>
          <ReloadButton onClick={this.handleReload}>
            Tải lại trang
          </ReloadButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}
